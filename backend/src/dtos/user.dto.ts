import { z } from "zod";
import { UserSchema } from "../types/user.type";

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

// Login Dto
// 1. Create new schame
// export const LoginUserDTO = z.object({
//     email: z.email(),
//     password: z.string().min(6, "Password must be at least 6 characters long")
// });
// 2. Reuse existing schema
export const LoginUserDTO = UserSchema.pick({
    email: true,
    password: true
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
    newPassword: z.string().min(6, "New password must be at least 6 characters long")
});
export type UpdatePasswordDTO = z.infer<typeof UpdatePasswordDTO>;