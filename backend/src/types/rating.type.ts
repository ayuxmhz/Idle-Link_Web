import { z } from "zod";

export const RatingSchema = z.object({
    booking: z.string(),
    device: z.string(),
    buyer: z.string(),
    seller: z.string(),
    stars: z.number().int().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
    review: z.string().max(500, "Review must be 500 characters or fewer").optional()
});
export type RatingType = z.infer<typeof RatingSchema>;
