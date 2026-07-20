import mongoose, { Schema, Document } from "mongoose";
import { BookingType } from "../types/booking.type";

export interface IBooking extends Omit<BookingType, "device" | "seller" | "buyer">, Document {
    _id: mongoose.Types.ObjectId;
    device: mongoose.Types.ObjectId;
    seller: mongoose.Types.ObjectId;
    buyer: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const BookingMongoSchema: Schema = new Schema<IBooking>(
    {
        device: { type: Schema.Types.ObjectId, ref: "Device", required: true },
        seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
        buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
        taskName: { type: String, required: true },
        status: { type: String, enum: ["pending", "running", "completed", "cancelled"], default: "pending" },
        pricePerHour: { type: Number, required: true },
        startedAt: { type: Date, required: true },
        estimatedCompletionAt: { type: Date, required: true },
        totalCost: { type: Number, required: true }
    },
    {
        timestamps: true
    }
);

BookingMongoSchema.index({ seller: 1, status: 1 });
BookingMongoSchema.index({ buyer: 1, status: 1 });
BookingMongoSchema.index({ device: 1, status: 1 });

export const BookingModel = mongoose.model<IBooking>(
    "Booking", // db.bookings -> Model Name "Booking"
    BookingMongoSchema
);
