import { z } from "zod";

// Mirrors backend/src/types/user.type.ts's PasswordSchema — kept in sync so
// the frontend surfaces the same rule before a request ever reaches the API.
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const PASSWORD_HINT = "At least 8 characters, with a letter, a number, and a special character.";
