import axiosInstance from "./axios-instance";
import { API } from "./endpoints";
import { AxiosError } from "axios";

export interface ConsoleLine {
    text: string;
    level: "info" | "warn";
}

export interface Booking {
    _id: string;
    device: string;
    seller: string;
    buyer: string;
    buyerUsername?: string;
    taskName: string;
    status: "pending" | "running" | "completed" | "cancelled";
    pricePerHour: number;
    startedAt: string;
    estimatedCompletionAt: string;
    totalCost: number;
    createdAt: string;
    // derived, only present for running bookings
    progress?: number;
    consoleLines?: ConsoleLine[];
    cpuUtilPercent?: number;
    ramUsedGB?: number;
    ramTotalGB?: number;
    gpuLabel?: string;
    gpuUtilPercent?: number;
}

export interface ListBookingsParams {
    role?: "seller" | "buyer";
    status?: string;
    page?: number;
    limit?: number;
}

const extractMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(axiosError.response?.data?.message || fallback);
};

export const listMyBookings = async (params: ListBookingsParams = {}) => {
    try {
        const response = await axiosInstance.get(API.BOOKINGS.BASE, { params });
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to fetch bookings");
    }
};

export const getBooking = async (id: string) => {
    try {
        const response = await axiosInstance.get(`${API.BOOKINGS.BASE}/${id}`);
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to fetch booking");
    }
};

export const createBooking = async (deviceId: string, taskName: string, estimatedHours: number) => {
    try {
        const response = await axiosInstance.post(API.BOOKINGS.BASE, { deviceId, taskName, estimatedHours });
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to create booking");
    }
};

export const updateBookingStatus = async (id: string, status: "cancelled" | "completed") => {
    try {
        const response = await axiosInstance.patch(`${API.BOOKINGS.BASE}/${id}`, { status });
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to update booking");
    }
};
