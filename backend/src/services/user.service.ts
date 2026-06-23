import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bycryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";

const userRepository = new UserMongoRepository();

export class UserService {
    async createUser(userData: CreateUserDTO): Promise<IUser> {
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
        const user = await userRepository.update(id, updateData);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
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
}