import { BookingModel, IBooking } from "../models/booking.model";

export interface BookingListFilters {
    userId: string;
    role: "seller" | "buyer";
    status?: string;
}

export interface IBookingRepository {
    createBooking(booking: Partial<IBooking>): Promise<IBooking>;
    getBookingById(id: string): Promise<IBooking | null>;
    getAll(): Promise<IBooking[]>;
    update(id: string, booking: Partial<IBooking>): Promise<IBooking | null>;
    delete(id: string): Promise<boolean>;
    getAllPaginated(page: number, limit: number, filters: BookingListFilters): Promise<{ data: IBooking[], total: number }>;
    hasActiveBookingForDevice(deviceId: string): Promise<boolean>;
    getActiveDeviceIds(deviceIds: string[]): Promise<Set<string>>;
    findActiveForSeller(sellerId: string): Promise<IBooking[]>;
    completeIfRunning(id: string): Promise<IBooking | null>;
}

export class BookingMongoRepository implements IBookingRepository {
    async createBooking(booking: Partial<IBooking>): Promise<IBooking> {
        const created = await BookingModel.create(booking);
        return created;
    }
    async getBookingById(id: string): Promise<IBooking | null> {
        // Intentionally NOT populated: booking.buyer/.seller are compared as raw
        // ObjectId strings throughout the service layer's authorization checks.
        // Buyer display info is looked up separately when building the client view.
        const found = await BookingModel.findOne({ _id: id });
        return found;
    }
    async getAll(): Promise<IBooking[]> {
        const found = await BookingModel.find();
        return found;
    }
    async update(id: string, booking: Partial<IBooking>): Promise<IBooking | null> {
        const updated = await BookingModel.findByIdAndUpdate(id, booking, { returnDocument: "after" });
        return updated;
    }
    async delete(id: string): Promise<boolean> {
        const deleted = await BookingModel.findByIdAndDelete(id);
        return !!deleted;
    }

    async getAllPaginated(page: number, limit: number, filters: BookingListFilters): Promise<{ data: IBooking[], total: number }> {
        const query: any = {
            [filters.role]: filters.userId
        };
        if (filters.status) query.status = filters.status;

        const total = await BookingModel.countDocuments(query);
        const data = await BookingModel.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort("-createdAt");

        return { data, total };
    }

    async hasActiveBookingForDevice(deviceId: string): Promise<boolean> {
        const found = await BookingModel.exists({ device: deviceId, status: "running" });
        return !!found;
    }

    async getActiveDeviceIds(deviceIds: string[]): Promise<Set<string>> {
        const found = await BookingModel.find(
            { device: { $in: deviceIds }, status: "running" },
            "device"
        );
        return new Set(found.map((b) => b.device.toString()));
    }

    async findActiveForSeller(sellerId: string): Promise<IBooking[]> {
        const found = await BookingModel.find({ seller: sellerId, status: "running" }).sort("-createdAt");
        return found;
    }

    async completeIfRunning(id: string): Promise<IBooking | null> {
        // Atomic conditional update: only matches (and returns the PRE-update doc)
        // if status is still "running" at the moment of the update, preventing
        // double-payout when two concurrent reads race on the same booking.
        const preUpdateDoc = await BookingModel.findOneAndUpdate(
            { _id: id, status: "running" },
            { status: "completed" },
            { returnDocument: "before" }
        );
        return preUpdateDoc;
    }
}
