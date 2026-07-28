import axiosInstance from "./axios-instance";
import { AxiosError } from "axios";

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

const extractMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(axiosError.response?.data?.message || fallback);
};

export const initiateEsewaDeposit = async (amount: number) => {
    try {
        const response = await axiosInstance.post("/api/v1/transactions/esewa/initiate", { amount });
        return response.data as { success: boolean; data: { paymentUrl: string; fields: EsewaFormFields } };
    } catch (error) {
        return extractMessage(error, "Failed to start eSewa payment");
    }
};

export const verifyEsewaPayment = async (transactionUuid: string) => {
    try {
        const response = await axiosInstance.post("/api/v1/transactions/esewa/verify", { transactionUuid });
        return response.data as { success: boolean; data: { amount: number; status: string } };
    } catch (error) {
        return extractMessage(error, "Failed to verify eSewa payment");
    }
};
