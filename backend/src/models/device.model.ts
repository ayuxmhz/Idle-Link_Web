import mongoose, { Schema, Document } from "mongoose";
import { DeviceType } from "../types/device.type";

export interface IDevice extends Omit<DeviceType, "owner">, Document {
    _id: mongoose.Types.ObjectId;
    owner: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SpecsMongoSchema = new Schema(
    {
        cpu: { type: String, required: true },
        ramGB: { type: Number, required: true },
        gpu: { type: String, required: true },
        storageGB: { type: Number, required: true }
    },
    { _id: false }
);

const DeviceMongoSchema: Schema = new Schema<IDevice>(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        type: { type: String, enum: ["GPU", "CPU", "ML-Ready", "Gaming"], required: true },
        specs: { type: SpecsMongoSchema, required: true },
        hourlyRate: { type: Number, required: true },
        status: { type: String, enum: ["live", "offline"], default: "offline" },
        uptimePercent: { type: Number, default: 0 }
    },
    {
        timestamps: true
    }
);

DeviceMongoSchema.index({ owner: 1 });
DeviceMongoSchema.index({ type: 1, status: 1 });

export const DeviceModel = mongoose.model<IDevice>(
    "Device", // db.devices -> Model Name "Device"
    DeviceMongoSchema
);
