import { z } from "zod";

export const CreateRatingDTO = z.object({
    bookingId: z.string().min(1, "Booking is required"),
    stars: z.number().int().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
    review: z.string().max(500, "Review must be 500 characters or fewer").optional()
});
export type CreateRatingDTO = z.infer<typeof CreateRatingDTO>;
