import mongoose, { Schema, Document } from "mongoose";
import { RatingType } from "../types/rating.type";

export interface IRating extends Omit<RatingType, "booking" | "device" | "buyer" | "seller">, Document {
    _id: mongoose.Types.ObjectId;
    booking: mongoose.Types.ObjectId;
    device: mongoose.Types.ObjectId;
    buyer: mongoose.Types.ObjectId;
    seller: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const RatingMongoSchema: Schema = new Schema<IRating>(
    {
        booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
        device: { type: Schema.Types.ObjectId, ref: "Device", required: true },
        buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
        seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
        stars: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String }
    },
    {
        timestamps: true
    }
);

RatingMongoSchema.index({ device: 1 });

export const RatingModel = mongoose.model<IRating>(
    "Rating", // db.ratings -> Model Name "Rating"
    RatingMongoSchema
);
