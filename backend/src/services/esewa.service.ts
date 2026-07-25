import crypto from "crypto";
import { EsewaPaymentModel } from "../models/esewa-payment.model";
import { TransactionService } from "./transaction.service";
import { HttpException } from "../exceptions/http-exception";
import {
    ESEWA_MERCHANT_CODE,
    ESEWA_SECRET_KEY,
    ESEWA_PAYMENT_URL,
    ESEWA_STATUS_URL,
    FRONTEND_URL
} from "../configs/constant";
import { InitiateEsewaDTO } from "../dtos/esewa.dto";

const transactionService = new TransactionService();

export interface EsewaFormFields {
    amount: string;
    tax_amount: string;
    total_amount: string;
    transaction_uuid: string;
    product_code: string;
    product_service_charge: string;
    product_delivery_charge: string;
    success_url: string;
    failure_url: string;
    signed_field_names: string;
    signature: string;
}

export class EsewaService {
    async initiate(userId: string, dto: InitiateEsewaDTO): Promise<{ paymentUrl: string; fields: EsewaFormFields }> {
        const transactionUuid = crypto.randomUUID();
        const amount = dto.amount;
        const taxAmount = 0;
        const totalAmount = amount + taxAmount;

        await EsewaPaymentModel.create({
            user: userId,
            transactionUuid,
            amount,
            status: "pending"
        });

        // eSewa v2 requires signing exactly the fields listed in signed_field_names,
        // in that order, as a comma-separated "key=value" string.
        const signedFieldNames = "total_amount,transaction_uuid,product_code";
        const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_MERCHANT_CODE}`;
        const signature = crypto
            .createHmac("sha256", ESEWA_SECRET_KEY)
            .update(message)
            .digest("base64");

        const fields: EsewaFormFields = {
            amount: String(amount),
            tax_amount: String(taxAmount),
            total_amount: String(totalAmount),
            transaction_uuid: transactionUuid,
            product_code: ESEWA_MERCHANT_CODE,
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: `${FRONTEND_URL}/dashboard/wallet/esewa/success`,
            failure_url: `${FRONTEND_URL}/dashboard/wallet/esewa/failure`,
            signed_field_names: signedFieldNames,
            signature
        };

        return { paymentUrl: ESEWA_PAYMENT_URL, fields };
    }

    async verify(userId: string, transactionUuid: string): Promise<{ amount: number; status: string }> {
        const payment = await EsewaPaymentModel.findOne({ transactionUuid });
        if (!payment) {
            throw new HttpException(404, "Payment record not found");
        }
        if (payment.user.toString() !== userId) {
            throw new HttpException(403, "This payment does not belong to you");
        }
        if (payment.status === "complete") {
            // Idempotent: already verified & credited on a previous call, never double-credit.
            return { amount: payment.amount, status: "complete" };
        }

        const statusUrl = `${ESEWA_STATUS_URL}?product_code=${ESEWA_MERCHANT_CODE}&total_amount=${payment.amount}&transaction_uuid=${transactionUuid}`;
        let result: { status?: string };
        try {
            const response = await fetch(statusUrl);
            if (!response.ok) {
                throw new HttpException(502, "Unable to reach eSewa to verify payment");
            }
            result = await response.json() as { status?: string };
        } catch {
            throw new HttpException(502, "Unable to reach eSewa to verify payment");
        }

        if (result.status !== "COMPLETE") {
            payment.status = "failed";
            await payment.save();
            throw new HttpException(400, `Payment not completed (status: ${result.status || "UNKNOWN"})`);
        }

        payment.status = "complete";
        await payment.save();

        await transactionService.deposit(userId, { amount: payment.amount });

        return { amount: payment.amount, status: "complete" };
    }
}
