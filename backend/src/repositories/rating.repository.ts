import mongoose from "mongoose";
import { RatingModel, IRating } from "../models/rating.model";

export interface DeviceRatingSummary {
    avgRating: number;
    count: number;
}

export interface IRatingRepository {
    createRating(rating: Partial<IRating>): Promise<IRating>;
    getByBooking(bookingId: string): Promise<IRating | null>;
    getByBookingIds(bookingIds: string[]): Promise<Map<string, IRating>>;
    getByDevice(deviceId: string, page: number, limit: number): Promise<{ data: IRating[], total: number }>;
    getDeviceSummaries(deviceIds: string[]): Promise<Map<string, DeviceRatingSummary>>;
}

export class RatingMongoRepository implements IRatingRepository {
    async createRating(rating: Partial<IRating>): Promise<IRating> {
        const created = await RatingModel.create(rating);
        return created;
    }

    async getByBooking(bookingId: string): Promise<IRating | null> {
        const found = await RatingModel.findOne({ booking: bookingId });
        return found;
    }

    async getByBookingIds(bookingIds: string[]): Promise<Map<string, IRating>> {
        const found = await RatingModel.find({ booking: { $in: bookingIds } });
        return new Map(found.map((r) => [r.booking.toString(), r]));
    }

    async getByDevice(deviceId: string, page: number, limit: number): Promise<{ data: IRating[], total: number }> {
        const query = { device: deviceId };
        const total = await RatingModel.countDocuments(query);
        const data = await RatingModel.find(query)
            .populate("buyer", "username firstName lastName profilePicture")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort("-createdAt");
        return { data, total };
    }

    async getDeviceSummaries(deviceIds: string[]): Promise<Map<string, DeviceRatingSummary>> {
        const results = await RatingModel.aggregate([
            { $match: { device: { $in: deviceIds.map((id) => new mongoose.Types.ObjectId(id)) } } },
            { $group: { _id: "$device", avgRating: { $avg: "$stars" }, count: { $sum: 1 } } }
        ]);
        return new Map(
            results.map((r) => [r._id.toString(), { avgRating: Math.round(r.avgRating * 10) / 10, count: r.count }])
        );
    }
}
