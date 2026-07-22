import { UserService } from "../services/user.service";
import { z } from "zod";
import { CreateUserDTO, LoginUserDTO, ForgotPasswordDTO, ResetPasswordDTO, GoogleAuthDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { Request, Response } from "express";
const userService = new UserService();

export class UserController {
    async createUser(req: Request, res: Response) {
        try {
            const userData = CreateUserDTO.safeParse(req.body);
            if (!userData.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(userData.error), 400);
            }
            const user = await userService.createUser(userData.data);
            return ApiResponseHelper.success(res, user, "User created successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
    
    async loginUser(req: Request, res: Response) {
        try{
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(parsedData.error), 400);
            }
            const { user, token } = await userService.loginUser(parsedData.data);
            return ApiResponseHelper.success(res, { user, token }, "Login successful");
        }catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async googleAuth(req: Request, res: Response) {
        try {
            const parsedData = GoogleAuthDTO.safeParse(req.body);
            if (!parsedData.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(parsedData.error), 400);
            }
            const { user, token } = await userService.googleAuth(parsedData.data.accessToken);
            return ApiResponseHelper.success(res, { user, token }, "Login successful");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async whoami(req: Request, res: Response) {
        try {
            const user = req.user;
            if (!user) {
                return ApiResponseHelper.error(res, "User not found", 404);
            }
            return ApiResponseHelper.success(res, user, "User fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const user = req.user as any;
            if (!user) {
                return ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const updateData: any = {};

            // Allowed text fields
            if (req.body.firstName !== undefined) updateData.firstName = req.body.firstName;
            if (req.body.lastName !== undefined) updateData.lastName = req.body.lastName;
            if (req.body.email !== undefined) updateData.email = req.body.email;
            if (req.body.phoneNumber !== undefined) updateData.phoneNumber = req.body.phoneNumber;

            // Handle file upload
            if (req.file) {
                updateData.profilePicture = `/uploads/${req.file.filename}`;
            }

            const updatedUser = await userService.updateProfile(user._id, updateData);
            return ApiResponseHelper.success(res, updatedUser, "Profile updated successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updatePassword(req: Request, res: Response) {
        try {
            const user = req.user as any;
            if (!user) {
                return ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            
            await userService.updatePassword(user._id, req.body);
            return ApiResponseHelper.success(res, null, "Password updated successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const parsed = ForgotPasswordDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            await userService.requestPasswordReset(parsed.data.email);
            return ApiResponseHelper.success(res, null, "If that email is registered, a reset code has been sent");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const parsed = ResetPasswordDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            await userService.resetPassword(parsed.data.email, parsed.data.code, parsed.data.newPassword);
            return ApiResponseHelper.success(res, null, "Password reset successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async sendEmailOtp(req: Request, res: Response) {
        try {
            const user = req.user as any;
            if (!user) return ApiResponseHelper.error(res, "Unauthorized", 401);
            if (!user.email) return ApiResponseHelper.error(res, "No email address found", 400);

            const code = await userService.sendEmailOtp(user._id, user.email);
            return ApiResponseHelper.success(res, { devCode: code }, "Verification code sent successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async sendPhoneOtp(req: Request, res: Response) {
        try {
            const user = req.user as any;
            if (!user) return ApiResponseHelper.error(res, "Unauthorized", 401);
            if (!user.phoneNumber) return ApiResponseHelper.error(res, "No phone number found", 400);

            const code = await userService.sendPhoneOtp(user._id, user.phoneNumber);
            return ApiResponseHelper.success(res, { devCode: code }, "Verification code sent successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async verifyEmailOtp(req: Request, res: Response) {
        try {
            const user = req.user as any;
            if (!user) return ApiResponseHelper.error(res, "Unauthorized", 401);
            const { code } = req.body;
            if (!code) return ApiResponseHelper.error(res, "Verification code is required", 400);

            await userService.verifyEmailOtp(user._id, code);
            return ApiResponseHelper.success(res, null, "Email verified successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async verifyPhoneOtp(req: Request, res: Response) {
        try {
            const user = req.user as any;
            if (!user) return ApiResponseHelper.error(res, "Unauthorized", 401);
            const { code } = req.body;
            if (!code) return ApiResponseHelper.error(res, "Verification code is required", 400);

            await userService.verifyPhoneOtp(user._id, code);
            return ApiResponseHelper.success(res, null, "Phone number verified successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}