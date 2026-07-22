import { BookingMongoRepository } from "../repositories/booking.repository";
import { DeviceMongoRepository } from "../repositories/device.repository";
import { UserMongoRepository } from "../repositories/user.repository";
import { RatingMongoRepository } from "../repositories/rating.repository";
import { TransactionService } from "./transaction.service";
import { NotificationService } from "./notification.service";
import { CreateBookingDTO, UpdateBookingStatusDTO } from "../dtos/booking.dto";
import { IBooking } from "../models/booking.model";
import { IDevice } from "../models/device.model";
import { HttpException } from "../exceptions/http-exception";

const bookingRepository = new BookingMongoRepository();
const deviceRepository = new DeviceMongoRepository();
const userRepository = new UserMongoRepository();
const ratingRepository = new RatingMongoRepository();
const transactionService = new TransactionService();
const notificationService = new NotificationService();

interface ConsoleLine {
    text: string;
    level: "info" | "warn";
}

const CONSOLE_SCRIPT: ConsoleLine[] = [
    { text: "Loading dataset shards 1-40...", level: "info" },
    { text: "Initializing distributed training...", level: "info" },
    { text: "GPU 1 temperature: 82°C. Engaging auxiliary cooling.", level: "warn" },
    { text: "Epoch 1/10 started. Batch size 32.", level: "info" },
    { text: "Loss: 2.3411, Step: 100/5000", level: "info" },
    { text: "Epoch 3/10. Loss: 1.8822, Step: 1500/5000", level: "info" }
];

export class BookingService {
    async createBooking(buyerId: string, dto: CreateBookingDTO): Promise<IBooking> {
        const device = await deviceRepository.getDeviceById(dto.deviceId);
        if (!device) {
            throw new HttpException(404, "Device not found");
        }
        if (device.status !== "live") {
            throw new HttpException(400, "Device is not available for booking");
        }
        if (device.owner.toString() === buyerId) {
            throw new HttpException(400, "You cannot book your own device");
        }
        const hasActive = await bookingRepository.hasActiveBookingForDevice(dto.deviceId);
        if (hasActive) {
            throw new HttpException(400, "Device already has an active booking");
        }

        const buyer = await userRepository.getUserById(buyerId);
        if (!buyer) {
            throw new HttpException(404, "Buyer not found");
        }

        const totalCost = Math.round(device.hourlyRate * dto.estimatedHours * 100) / 100;
        if ((buyer.walletBalance ?? 0) < totalCost) {
            throw new HttpException(400, "Insufficient wallet balance");
        }

        await userRepository.update(buyerId, { walletBalance: (buyer.walletBalance ?? 0) - totalCost });

        const startedAt = new Date();
        const estimatedCompletionAt = new Date(startedAt.getTime() + dto.estimatedHours * 60 * 60 * 1000);

        const booking = await bookingRepository.createBooking({
            device: dto.deviceId as any,
            seller: device.owner as any,
            buyer: buyerId as any,
            taskName: dto.taskName,
            status: "running",
            pricePerHour: device.hourlyRate,
            startedAt,
            estimatedCompletionAt,
            totalCost
        });

        await transactionService.record({
            user: buyerId,
            booking: booking._id.toString(),
            type: "job_payment",
            amount: -totalCost,
            description: `Booking: ${dto.taskName}`
        });

        await notificationService.notify(
            device.owner.toString(),
            "booking_created",
            `${buyer.username} booked "${device.name}" for "${dto.taskName}"`
        );

        return booking;
    }

    async getBookingById(id: string, requesterId: string, requesterRole: string): Promise<Record<string, any>> {
        let booking = await bookingRepository.getBookingById(id);
        if (!booking) {
            throw new HttpException(404, "Booking not found");
        }
        const isParty = booking.buyer.toString() === requesterId || booking.seller.toString() === requesterId;
        if (!isParty && requesterRole !== "admin") {
            throw new HttpException(403, "You do not have access to this booking");
        }
        booking = await this.maybeCompleteBooking(booking);
        return this.enrichBooking(booking);
    }

    async listMine(userId: string, role: "seller" | "buyer", status: string | undefined, page: number, limit: number) {
        const { data, total } = await bookingRepository.getAllPaginated(page, limit, { userId, role, status });

        const enriched: Record<string, any>[] = [];
        for (const booking of data) {
            const completed = await this.maybeCompleteBooking(booking);
            enriched.push(await this.enrichBooking(completed));
        }

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

    async updateBookingStatus(id: string, requesterId: string, dto: UpdateBookingStatusDTO): Promise<IBooking> {
        const booking = await bookingRepository.getBookingById(id);
        if (!booking) {
            throw new HttpException(404, "Booking not found");
        }

        if (dto.status === "cancelled") {
            if (booking.buyer.toString() !== requesterId) {
                throw new HttpException(403, "Only the buyer can cancel this booking");
            }
            if (booking.status !== "running") {
                throw new HttpException(400, "Booking cannot be cancelled in its current state");
            }

            const updated = await bookingRepository.update(id, { status: "cancelled", cancelReason: dto.reason });
            if (!updated) {
                throw new HttpException(404, "Booking not found");
            }

            const buyer = await userRepository.getUserById(booking.buyer.toString());
            if (buyer) {
                await userRepository.update(booking.buyer.toString(), {
                    walletBalance: (buyer.walletBalance ?? 0) + booking.totalCost
                });
            }
            await transactionService.record({
                user: booking.buyer.toString(),
                booking: booking._id.toString(),
                type: "job_payment",
                amount: booking.totalCost,
                description: `Refund: cancelled booking - ${booking.taskName}`
            });

            await notificationService.notify(
                booking.seller.toString(),
                "booking_created",
                `Booking "${booking.taskName}" was cancelled by the buyer: ${dto.reason}`
            );

            return updated;
        }

        // dto.status === "completed" (explicit early-complete)
        const isParty = booking.seller.toString() === requesterId || booking.buyer.toString() === requesterId;
        if (!isParty) {
            throw new HttpException(403, "You do not have access to this booking");
        }
        if (booking.status !== "running") {
            throw new HttpException(400, "Only a running booking can be completed");
        }

        const preUpdate = await bookingRepository.completeIfRunning(id);
        if (preUpdate) {
            await this.payOutBooking(preUpdate);
        }
        const fresh = await bookingRepository.getBookingById(id);
        if (!fresh) {
            throw new HttpException(404, "Booking not found");
        }
        return fresh;
    }

    async deleteBooking(id: string, requesterId: string): Promise<void> {
        await this.updateBookingStatus(id, requesterId, { status: "cancelled", reason: "Cancelled by buyer" });
    }

    // --- internal helpers below ---

    private async maybeCompleteBooking(booking: IBooking): Promise<IBooking> {
        if (booking.status !== "running") {
            return booking;
        }
        const progress = this.computeProgress(booking);
        if (progress < 100) {
            return booking;
        }

        // Atomic compare-and-swap: only pays out once even if two requests
        // race to complete the same booking at the same time.
        const preUpdate = await bookingRepository.completeIfRunning(booking._id.toString());
        if (!preUpdate) {
            // Another concurrent request already completed it — return latest state.
            const fresh = await bookingRepository.getBookingById(booking._id.toString());
            return fresh ?? booking;
        }

        await this.payOutBooking(preUpdate);
        booking.status = "completed";
        return booking;
    }

    private async payOutBooking(booking: IBooking): Promise<void> {
        const sellerAmount = Math.round(booking.totalCost * 0.85 * 100) / 100;
        const commissionAmount = Math.round(booking.totalCost * 0.15 * 100) / 100;

        const seller = await userRepository.getUserById(booking.seller.toString());
        if (seller) {
            await userRepository.update(booking.seller.toString(), {
                walletBalance: (seller.walletBalance ?? 0) + sellerAmount
            });
        }
        await transactionService.record({
            user: booking.seller.toString(),
            booking: booking._id.toString(),
            type: "job_payment",
            amount: sellerAmount,
            description: `Payout: ${booking.taskName}`
        });

        await notificationService.notify(
            booking.seller.toString(),
            "payment_received",
            `You earned NPR ${sellerAmount} from "${booking.taskName}"`
        );
        await notificationService.notify(
            booking.buyer.toString(),
            "booking_completed",
            `Your job "${booking.taskName}" has completed`
        );

        const admin = await userRepository.getFirstAdmin();
        if (admin) {
            await userRepository.update(admin._id.toString(), {
                walletBalance: (admin.walletBalance ?? 0) + commissionAmount
            });
            await transactionService.record({
                user: admin._id.toString(),
                booking: booking._id.toString(),
                type: "commission",
                amount: commissionAmount,
                description: `Commission: ${booking.taskName}`
            });
        }
    }

    private async enrichBooking(booking: IBooking): Promise<Record<string, any>> {
        const obj = booking.toObject();
        const progress = this.computeProgress(booking);
        const buyer = await userRepository.getUserById(booking.buyer.toString());
        const buyerUsername = buyer?.username;

        if (booking.status === "completed") {
            const rating = await ratingRepository.getByBooking(booking._id.toString());
            return {
                ...obj,
                progress,
                buyerUsername,
                rating: rating ? { stars: rating.stars, review: rating.review } : null
            };
        }

        if (booking.status !== "running") {
            return { ...obj, progress, buyerUsername };
        }

        const device = await deviceRepository.getDeviceById(booking.device.toString());
        const utilization = device ? this.deriveUtilization(booking, device) : {};

        return {
            ...obj,
            progress,
            buyerUsername,
            consoleLines: this.deriveConsoleLines(progress),
            ...utilization
        };
    }

    private computeProgress(booking: IBooking): number {
        if (booking.status === "completed") return 100;
        if (booking.status !== "running") return 0;

        const total = booking.estimatedCompletionAt.getTime() - booking.startedAt.getTime();
        if (total <= 0) return 100;

        const elapsed = Date.now() - booking.startedAt.getTime();
        const pct = (elapsed / total) * 100;
        // Capped at 100 (not 99) so elapsed time can actually reach the
        // completion threshold — maybeCompleteBooking() only fires at >=100.
        return Math.min(100, Math.max(0, Math.round(pct)));
    }

    private deriveConsoleLines(progress: number): ConsoleLine[] {
        const lineCount = Math.max(1, Math.min(CONSOLE_SCRIPT.length, Math.ceil((progress / 100) * CONSOLE_SCRIPT.length) + 1));
        return CONSOLE_SCRIPT.slice(0, lineCount);
    }

    private deriveUtilization(booking: IBooking, device: IDevice) {
        // Deterministic-but-slowly-moving jitter: seeded off the booking id and the
        // current minute, so numbers look "alive" between page reloads without
        // needing a background job or stored state.
        const minuteBucket = Math.floor(Date.now() / 60000);
        const seed = this.hashSeed(booking._id.toString() + minuteBucket);
        const jitter = (offset: number) => ((seed >>> offset) % 21) / 100; // 0.00 - 0.20

        const ramTotalGB = device.specs.ramGB;
        const ramUsedGB = Math.min(ramTotalGB, Math.round(ramTotalGB * (0.4 + jitter(4)) * 10) / 10);

        return {
            cpuUtilPercent: Math.min(99, Math.round(60 + jitter(0) * 100)),
            ramUsedGB,
            ramTotalGB,
            gpuLabel: device.specs.gpu,
            gpuUtilPercent: Math.min(99, Math.round(65 + jitter(8) * 100))
        };
    }

    private hashSeed(input: string): number {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            hash = (hash << 5) - hash + input.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }
}
