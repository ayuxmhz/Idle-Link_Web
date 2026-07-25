import mongoose, { Schema, Document } from "mongoose";

export interface IEsewaPayment extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    transactionUuid: string;
    amount: number;
    status: "pending" | "complete" | "failed";
    createdAt: Date;
    updatedAt: Date;
}

const EsewaPaymentSchema: Schema = new Schema<IEsewaPayment>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        transactionUuid: { type: String, required: true, unique: true },
        amount: { type: Number, required: true },
        status: { type: String, enum: ["pending", "complete", "failed"], default: "pending" }
    },
    {
        timestamps: true
    }
);

export const EsewaPaymentModel = mongoose.model<IEsewaPayment>(
    "EsewaPayment", // db.esewapayments -> Model Name "EsewaPayment"
    EsewaPaymentSchema
);
