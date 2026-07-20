import { DeviceModel, IDevice } from "../models/device.model";

export interface DeviceListFilters {
    owner?: string;
    type?: string;
    status?: string;
    sort?: string;
    search?: string;
}

export interface IDeviceRepository {
    createDevice(device: Partial<IDevice>): Promise<IDevice>;
    getDeviceById(id: string): Promise<IDevice | null>;
    getAll(): Promise<IDevice[]>;
    update(id: string, device: Partial<IDevice>): Promise<IDevice | null>;
    delete(id: string): Promise<boolean>;
    getAllPaginated(page: number, limit: number, filters: DeviceListFilters): Promise<{ data: IDevice[], total: number }>;
}

export class DeviceMongoRepository implements IDeviceRepository {
    async createDevice(device: Partial<IDevice>): Promise<IDevice> {
        const created = await DeviceModel.create(device);
        return created;
    }
    async getDeviceById(id: string): Promise<IDevice | null> {
        const found = await DeviceModel.findOne({ _id: id });
        return found;
    }
    async getAll(): Promise<IDevice[]> {
        const found = await DeviceModel.find();
        return found;
    }
    async update(id: string, device: Partial<IDevice>): Promise<IDevice | null> {
        const updated = await DeviceModel.findByIdAndUpdate(id, device, { new: true });
        return updated;
    }
    async delete(id: string): Promise<boolean> {
        const deleted = await DeviceModel.findByIdAndDelete(id);
        return !!deleted;
    }

    async getAllPaginated(page: number, limit: number, filters: DeviceListFilters): Promise<{ data: IDevice[], total: number }> {
        const query: any = {};
        if (filters.owner) query.owner = filters.owner;
        if (filters.type) query.type = filters.type;
        if (filters.status) query.status = filters.status;
        if (filters.search) query.name = { $regex: filters.search, $options: "i" };

        const sort = filters.sort || "-createdAt";

        const total = await DeviceModel.countDocuments(query);
        // Intentionally NOT populated — callers that display owner info attach it
        // separately (see DeviceService.attachOwnerUsernames) so `owner` stays a
        // raw ObjectId string comparable against the current user's id client-side.
        const data = await DeviceModel.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort(sort);

        return { data, total };
    }
}
