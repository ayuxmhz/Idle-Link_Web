import { z } from "zod";

export const MatchQueryDTO = z.object({
    query: z.string().min(3, "Describe your task in a bit more detail")
});
export type MatchQueryDTO = z.infer<typeof MatchQueryDTO>;
