import axiosInstance from "./axios-instance";
import { AxiosError } from "axios";

export interface Rating {
    _id: string;
    booking: string;
    device: string;
    buyer: string;
    seller: string;
    stars: number;
    review?: string;
    buyerUsername?: string;
    buyerProfilePicture?: string;
    createdAt: string;
}

export interface RatingSummary {
    avgRating: number;
    count: number;
}

const extractMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(axiosError.response?.data?.message || fallback);
};

export const createRating = async (bookingId: string, stars: number, review?: string) => {
    try {
        const response = await axiosInstance.post("/api/v1/ratings", { bookingId, stars, review });
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to submit rating");
    }
};

export const getDeviceRatings = async (deviceId: string, params: { page?: number; limit?: number } = {}) => {
    try {
        const response = await axiosInstance.get(`/api/v1/ratings/device/${deviceId}`, { params });
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to fetch ratings");
    }
};
