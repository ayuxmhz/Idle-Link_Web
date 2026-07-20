import { Request, Response } from "express";
import { UserService } from "../../services/user.service";
import { ApiResponseHelper } from "../../utils/apihelper.util";

const userService = new UserService();

export class AdminUserController {
    async getUsers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;

            const result = await userService.getAllUsersPaginated(page, limit, search);
            return ApiResponseHelper.success(res, result.data, "Users fetched successfully", 200, result.meta);
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async getUser(req: Request, res: Response) {
        try {
            const user = await userService.getUserById(req.params.id as string);
            return ApiResponseHelper.success(res, user, "User fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async createUser(req: Request, res: Response) {
        try {
            const user = await userService.createUser(req.body);
            return ApiResponseHelper.success(res, user, "User created successfully", 201);
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const user = await userService.updateUser(req.params.id as string, req.body);
            return ApiResponseHelper.success(res, user, "User updated successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            await userService.deleteUser(req.params.id as string);
            return ApiResponseHelper.success(res, null, "User deleted successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}
