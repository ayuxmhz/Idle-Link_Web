import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { OtpModel } from "../models/otp.model";
import { HttpException } from "../exceptions/http-exception";
import { sendVerificationEmail } from "../utils/mailer.util";
import bycryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";

const userRepository = new UserMongoRepository();

export class UserService {
    async createUser(userData: any): Promise<IUser> {
        // validation
        const existingEmail = await userRepository.getUserByEmail(userData.email);
        if (existingEmail) {
            throw new HttpException(400, "Email already exists");
        }
        const existingUsername = await userRepository.getUserByUsername(userData.username);
        if (existingUsername) {
            throw new HttpException(400, "Username already exists");
        }
        // hash password
        const hashedPassword = await bycryptjs.hash(userData.password, 10);
        userData.password = hashedPassword;
        
        // role defaults to user if not provided, but admin can provide it
        const user = await userRepository.createUser(userData);
        return user;
    }

    async loginUser(loginData: LoginUserDTO){
        const user = await userRepository.getUserByEmail(loginData.email);
        if (!user) {
            throw new HttpException(400, "Invalid email");
        }
        const isPasswordValid = await bycryptjs.compare(
            loginData.password,  // client password
            user.password // database password
        );
        if (!isPasswordValid) {
            throw new HttpException(400, "Invalid password");
        }
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role }, // payload
            SECRET_KEY,
            { expiresIn: "30d" }
        );
        return { user, token }
    }

    async updateProfile(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        const existing = await userRepository.getUserById(id);
        if (!existing) throw new HttpException(404, "User not found");

        // If email is being changed, check it's not taken and reset verification
        if (updateData.email && updateData.email !== existing.email) {
            const taken = await userRepository.getUserByEmail(updateData.email);
            if (taken) throw new HttpException(400, "Email already in use");
            (updateData as any).isEmailVerified = false; // must re-verify new email
        }

        // If phone number is being changed, reset phone verification
        if (updateData.phoneNumber && updateData.phoneNumber !== existing.phoneNumber) {
            (updateData as any).isPhoneVerified = false;
        }

        const user = await userRepository.update(id, updateData);
        if (!user) throw new HttpException(404, "User not found");
        return user;
    }

    async updatePassword(id: string, passwordData: any): Promise<IUser | null> {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        const isPasswordValid = await bycryptjs.compare(
            passwordData.currentPassword,
            user.password
        );
        if (!isPasswordValid) {
            throw new HttpException(400, "Invalid current password");
        }
        const hashedPassword = await bycryptjs.hash(passwordData.newPassword, 10);
        return await userRepository.update(id, { password: hashedPassword });
    }

    // --- Admin operations below ---
    async getAllUsersPaginated(page: number, limit: number, search?: string) {
        const { data, total } = await userRepository.getAllPaginated(page, limit, search);
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getUserById(id: string): Promise<IUser> {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        return user;
    }

    async updateUser(id: string, updateData: Partial<IUser> & { password?: string }): Promise<IUser> {
        const existing = await userRepository.getUserById(id);
        if (!existing) {
            throw new HttpException(404, "User not found");
        }
        
        if (updateData.email && updateData.email !== existing.email) {
            const emailTaken = await userRepository.getUserByEmail(updateData.email);
            if (emailTaken) {
                throw new HttpException(400, "Email already in use");
            }
        }
        if (updateData.username && updateData.username !== existing.username) {
            const usernameTaken = await userRepository.getUserByUsername(updateData.username);
            if (usernameTaken) {
                throw new HttpException(400, "Username already in use");
            }
        }

        if (updateData.password) {
            updateData.password = await bycryptjs.hash(updateData.password, 10);
        }

        const user = await userRepository.update(id, updateData);
        if (!user) {
            throw new HttpException(404, "User update failed");
        }
        return user;
    }

    async deleteUser(id: string): Promise<void> {
        const existing = await userRepository.getUserById(id);
        if (!existing) {
            throw new HttpException(404, "User not found");
        }
        await userRepository.delete(id);
    }

    async sendEmailOtp(userId: string, email: string): Promise<string> {
        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        // Remove any existing email OTPs for this user
        await OtpModel.deleteMany({ userId, type: "email" });

        // Save to database
        await OtpModel.create({
            userId,
            type: "email",
            target: email,
            code,
            expiresAt
        });

        // Send real email using our mailer utility
        try {
            await sendVerificationEmail(email, code);
        } catch (mailError) {
            console.warn("Failed to send real email (possibly offline). Falling back to console log:");
            console.log(`\n========================================`);
            console.log(`[EMAIL OTP FALLBACK] To: ${email} | Code: ${code}`);
            console.log(`========================================\n`);
        }

        return code;
    }

    async sendPhoneOtp(userId: string, phoneNumber: string): Promise<string> {
        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        // Remove any existing phone OTPs for this user
        await OtpModel.deleteMany({ userId, type: "phone" });

        // Save to database
        await OtpModel.create({
            userId,
            type: "phone",
            target: phoneNumber,
            code,
            expiresAt
        });

        // Log OTP to backend terminal console for development visibility
        console.log(`\n========================================`);
        console.log(`[SMS OTP] To: ${phoneNumber} | Code: ${code}`);
        console.log(`========================================\n`);

        return code;
    }

    async verifyEmailOtp(userId: string, code: string): Promise<boolean> {
        const otpRecord = await OtpModel.findOne({ userId, type: "email", code });
        if (!otpRecord) {
            throw new HttpException(400, "Invalid or expired verification code");
        }

        // Mark as verified on User
        await userRepository.update(userId, { isEmailVerified: true });

        // Cleanup OTP
        await OtpModel.deleteOne({ _id: otpRecord._id });
        return true;
    }

    async verifyPhoneOtp(userId: string, code: string): Promise<boolean> {
        const otpRecord = await OtpModel.findOne({ userId, type: "phone", code });
        if (!otpRecord) {
            throw new HttpException(400, "Invalid or expired verification code");
        }

        // Mark as verified on User
        await userRepository.update(userId, { isPhoneVerified: true });

        // Cleanup OTP
        await OtpModel.deleteOne({ _id: otpRecord._id });
        return true;
    }
}