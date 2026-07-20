import { Request, Response } from "express";
import { z } from "zod";
import { BookingService } from "../services/booking.service";
import { CreateBookingDTO, UpdateBookingStatusDTO } from "../dtos/booking.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";

const bookingService = new BookingService();

export class BookingController {
    async createBooking(req: Request, res: Response) {
        try {
            const parsed = CreateBookingDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = req.user as any;
            const booking = await bookingService.createBooking(user._id.toString(), parsed.data);
            return ApiResponseHelper.success(res, booking, "Booking created successfully", 201);
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async listMine(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const role = (req.query.role as string) === "buyer" ? "buyer" : "seller";
            const status = req.query.status as string | undefined;
            const user = req.user as any;

            const result = await bookingService.listMine(user._id.toString(), role, status, page, limit);
            return ApiResponseHelper.success(res, result.data, "Bookings fetched successfully", 200, result.meta);
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getBooking(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const booking = await bookingService.getBookingById(req.params.id as string, user._id.toString(), user.role);
            return ApiResponseHelper.success(res, booking, "Booking fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async updateStatus(req: Request, res: Response) {
        try {
            const parsed = UpdateBookingStatusDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = req.user as any;
            const booking = await bookingService.updateBookingStatus(req.params.id as string, user._id.toString(), parsed.data);
            return ApiResponseHelper.success(res, booking, "Booking updated successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async deleteBooking(req: Request, res: Response) {
        try {
            const user = req.user as any;
            await bookingService.deleteBooking(req.params.id as string, user._id.toString());
            return ApiResponseHelper.success(res, null, "Booking cancelled successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
