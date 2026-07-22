import { RatingMongoRepository } from "../repositories/rating.repository";
import { BookingMongoRepository } from "../repositories/booking.repository";
import { CreateRatingDTO } from "../dtos/rating.dto";
import { IRating } from "../models/rating.model";
import { HttpException } from "../exceptions/http-exception";

const ratingRepository = new RatingMongoRepository();
const bookingRepository = new BookingMongoRepository();

export class RatingService {
    async createRating(buyerId: string, dto: CreateRatingDTO): Promise<IRating> {
        const booking = await bookingRepository.getBookingById(dto.bookingId);
        if (!booking) {
            throw new HttpException(404, "Booking not found");
        }
        if (booking.buyer.toString() !== buyerId) {
            throw new HttpException(403, "Only the buyer can rate this booking");
        }
        if (booking.status !== "completed") {
            throw new HttpException(400, "Only completed bookings can be rated");
        }

        const existing = await ratingRepository.getByBooking(dto.bookingId);
        if (existing) {
            throw new HttpException(400, "This booking has already been rated");
        }

        return ratingRepository.createRating({
            booking: booking._id as any,
            device: booking.device as any,
            buyer: booking.buyer as any,
            seller: booking.seller as any,
            stars: dto.stars,
            review: dto.review
        });
    }

    async getDeviceRatings(deviceId: string, page: number, limit: number) {
        const { data, total } = await ratingRepository.getByDevice(deviceId, page, limit);
        const summaries = await ratingRepository.getDeviceSummaries([deviceId]);
        const summary = summaries.get(deviceId) ?? { avgRating: 0, count: 0 };

        return {
            data: data.map((r) => ({
                ...r.toObject(),
                buyerUsername: (r.buyer as any)?.username,
                buyerProfilePicture: (r.buyer as any)?.profilePicture
            })),
            summary,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}
