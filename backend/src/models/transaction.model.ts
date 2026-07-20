import mongoose, { Schema, Document } from "mongoose";
import { TransactionType } from "../types/transaction.type";

export interface ITransaction extends Omit<TransactionType, "user" | "booking">, Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    booking?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionMongoSchema: Schema = new Schema<ITransaction>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        booking: { type: Schema.Types.ObjectId, ref: "Booking" },
        type: { type: String, enum: ["job_payment", "commission", "deposit", "withdrawal"], required: true },
        amount: { type: Number, required: true },
        description: { type: String, required: true }
    },
    {
        timestamps: true
    }
);

TransactionMongoSchema.index({ user: 1, createdAt: -1 });

export const TransactionModel = mongoose.model<ITransaction>(
    "Transaction", // db.transactions -> Model Name "Transaction"
    TransactionMongoSchema
);
