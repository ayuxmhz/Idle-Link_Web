import { z } from "zod";

// Shared password strength rule — reused wherever a NEW password is set
// (registration, change-password, reset-password). Not applied to login,
// which only needs to check a password against the stored hash.
export const PasswordSchema = z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const UserSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: PasswordSchema,
    role: z.enum(["admin", "user"]).default("user"),
    profilePicture: z.string().optional(),
    phoneNumber: z.string().optional(),
    isEmailVerified: z.boolean().default(false),
    isPhoneVerified: z.boolean().default(false),
    walletBalance: z.number().default(0)
});
export type UserType = z.infer<typeof UserSchema>;