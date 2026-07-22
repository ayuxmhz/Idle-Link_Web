import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    type: "booking_created" | "booking_completed" | "payment_received" | "wallet_deposit" | "wallet_withdrawal";
    message: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema<INotification>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            enum: ["booking_created", "booking_completed", "payment_received", "wallet_deposit", "wallet_withdrawal"],
            required: true
        },
        message: { type: String, required: true },
        read: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
);

NotificationSchema.index({ user: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>(
    "Notification", // db.notifications -> Model Name "Notification"
    NotificationSchema
);
