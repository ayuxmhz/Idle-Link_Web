import { DeviceMongoRepository, DeviceListFilters } from "../repositories/device.repository";
import { BookingMongoRepository } from "../repositories/booking.repository";
import { CreateDeviceDTO, UpdateDeviceDTO } from "../dtos/device.dto";
import { IDevice } from "../models/device.model";
import { UserModel } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";

const deviceRepository = new DeviceMongoRepository();
const bookingRepository = new BookingMongoRepository();

export class DeviceService {
    async createDevice(ownerId: string, data: CreateDeviceDTO): Promise<IDevice> {
        const uptimePercent = Math.round((95 + Math.random() * 4.9) * 10) / 10; // 95.0 - 99.9
        const device = await deviceRepository.createDevice({
            ...data,
            owner: ownerId as any,
            status: "offline",
            uptimePercent
        });
        return device;
    }

    async listDevices(page: number, limit: number, filters: DeviceListFilters) {
        const { data, total } = await deviceRepository.getAllPaginated(page, limit, filters);
        const enriched = await this.attachOwnerUsernames(data);
        return {
            data: enriched,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Batched owner lookup so list views can display "listed by @username"
    // without populate()-ing the `owner` field itself (which would break
    // client-side `device.owner === currentUserId` ownership checks).
    private async attachOwnerUsernames(devices: IDevice[]): Promise<Record<string, any>[]> {
        const ownerIds = [...new Set(devices.map((d) => d.owner.toString()))];
        const owners = await UserModel.find({ _id: { $in: ownerIds } }, "username firstName lastName");
        const ownerMap = new Map(owners.map((o) => [o._id.toString(), o]));

        return devices.map((device) => {
            const owner = ownerMap.get(device.owner.toString());
            return {
                ...device.toObject(),
                ownerUsername: owner?.username
            };
        });
    }

    async getDeviceById(id: string): Promise<IDevice> {
        const device = await deviceRepository.getDeviceById(id);
        if (!device) {
            throw new HttpException(404, "Device not found");
        }
        return device;
    }

    async updateDevice(id: string, requesterId: string, data: UpdateDeviceDTO): Promise<IDevice> {
        const existing = await deviceRepository.getDeviceById(id);
        if (!existing) {
            throw new HttpException(404, "Device not found");
        }
        if (existing.owner.toString() !== requesterId) {
            throw new HttpException(403, "You do not own this device");
        }
        const updated = await deviceRepository.update(id, data as Partial<IDevice>);
        if (!updated) {
            throw new HttpException(404, "Device update failed");
        }
        return updated;
    }

    async deleteDevice(id: string, requesterId: string): Promise<void> {
        const existing = await deviceRepository.getDeviceById(id);
        if (!existing) {
            throw new HttpException(404, "Device not found");
        }
        if (existing.owner.toString() !== requesterId) {
            throw new HttpException(403, "You do not own this device");
        }
        const hasActiveBooking = await bookingRepository.hasActiveBookingForDevice(id);
        if (hasActiveBooking) {
            throw new HttpException(400, "Device has an active booking");
        }
        await deviceRepository.delete(id);
    }

    // --- Admin operations below (no ownership check) ---
    async adminDeleteDevice(id: string): Promise<void> {
        const existing = await deviceRepository.getDeviceById(id);
        if (!existing) {
            throw new HttpException(404, "Device not found");
        }
        const hasActiveBooking = await bookingRepository.hasActiveBookingForDevice(id);
        if (hasActiveBooking) {
            throw new HttpException(400, "Device has an active booking");
        }
        await deviceRepository.delete(id);
    }
}
