import { DeviceMongoRepository, DeviceListFilters } from "../repositories/device.repository";
import { BookingMongoRepository } from "../repositories/booking.repository";
import { RatingMongoRepository } from "../repositories/rating.repository";
import { CreateDeviceDTO, UpdateDeviceDTO } from "../dtos/device.dto";
import { IDevice } from "../models/device.model";
import { UserModel } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";

const deviceRepository = new DeviceMongoRepository();
const bookingRepository = new BookingMongoRepository();
const ratingRepository = new RatingMongoRepository();

export class DeviceService {
    async createDevice(ownerId: string, data: CreateDeviceDTO): Promise<IDevice> {
        // A freshly listed device has no operating history yet, so it starts
        // at a clean 100% instead of a fabricated random figure.
        const device = await deviceRepository.createDevice({
            ...data,
            owner: ownerId as any,
            status: "offline",
            uptimePercent: 100
        });
        return device;
    }

    async listDevices(page: number, limit: number, filters: DeviceListFilters) {
        const { data, total } = await deviceRepository.getAllPaginated(page, limit, filters);
        const withOwners = await this.attachOwnerUsernames(data);
        const withBooking = await this.attachActiveBookingFlag(withOwners);
        const enriched = await this.attachRatingSummary(withBooking);
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
    // Public so MatcherService can reuse it for AI-matched results too.
    async attachOwnerUsernames(devices: IDevice[]): Promise<Record<string, any>[]> {
        const ownerIds = [...new Set(devices.map((d) => d.owner.toString()))];
        const owners = await UserModel.find({ _id: { $in: ownerIds } }, "username firstName lastName profilePicture");
        const ownerMap = new Map(owners.map((o) => [o._id.toString(), o]));

        return devices.map((device) => {
            const owner = ownerMap.get(device.owner.toString());
            return {
                ...device.toObject(),
                ownerUsername: owner?.username,
                ownerProfilePicture: owner?.profilePicture
            };
        });
    }

    // Batched active-booking lookup so marketplace listings can show "Booked"
    // for devices with a running booking instead of relying only on the
    // server-side check at booking-creation time.
    private async attachActiveBookingFlag(devices: Record<string, any>[]): Promise<Record<string, any>[]> {
        const deviceIds = devices.map((d) => d._id.toString());
        const activeIds = await bookingRepository.getActiveDeviceIds(deviceIds);
        return devices.map((device) => ({
            ...device,
            hasActiveBooking: activeIds.has(device._id.toString())
        }));
    }

    // Batched rating lookup so marketplace listings can show an average
    // star rating and review count without a query per card.
    private async attachRatingSummary(devices: Record<string, any>[]): Promise<Record<string, any>[]> {
        const deviceIds = devices.map((d) => d._id.toString());
        const summaries = await ratingRepository.getDeviceSummaries(deviceIds);
        return devices.map((device) => {
            const summary = summaries.get(device._id.toString());
            return {
                ...device,
                avgRating: summary?.avgRating ?? null,
                ratingCount: summary?.count ?? 0
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
