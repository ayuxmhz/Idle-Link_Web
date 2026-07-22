import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
    userId: mongoose.Types.ObjectId;
    type: "email" | "phone" | "password_reset";
    target: string; // the email address or phone number being verified
    code: string;
    expiresAt: Date;
}

const OtpSchema = new Schema<IOtp>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["email", "phone", "password_reset"], required: true },
    target: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true }
}, {
    timestamps: true
});

// Automatically expire documents after expiresAt
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpModel = mongoose.model<IOtp>("Otp", OtpSchema);
