import { z } from "zod";
import { UserSchema, PasswordSchema } from "../types/user.type";

// Create a DTO for creating a user
// export const CreateUserDTO = UserSchema.omit({ role: true });
export const CreateUserDTO = UserSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    username: true,
    password: true
});
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

// Login Dto — intentionally NOT derived via UserSchema.pick(): login only
// checks a password against the stored hash, so it must accept whatever
// password an account was originally created with, even an older one that
// predates the strength rules in PasswordSchema. Only "set a new password"
// flows (register/change-password/reset-password) enforce strength.
export const LoginUserDTO = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required")
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = z.object({
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().min(1, "Last name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    phoneNumber: z.string().optional()
});
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;

export const UpdatePasswordDTO = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: PasswordSchema
});
export type UpdatePasswordDTO = z.infer<typeof UpdatePasswordDTO>;

export const ForgotPasswordDTO = z.object({
    email: z.email("Invalid email address")
});
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordDTO>;

export const ResetPasswordDTO = z.object({
    email: z.email("Invalid email address"),
    code: z.string().min(1, "Verification code is required"),
    newPassword: PasswordSchema
});
export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTO>;

export const GoogleAuthDTO = z.object({
    accessToken: z.string().min(1, "Google access token is required")
});
export type GoogleAuthDTO = z.infer<typeof GoogleAuthDTO>;