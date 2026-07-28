import axiosInstance from "./axios-instance";
import { AxiosError } from "axios";
import { Device } from "./devices";

export interface MatchedDevice extends Device {
    matchPercent: number;
    explanation: string;
}

export const findMatchingDevices = async (query: string) => {
    try {
        const response = await axiosInstance.post("/api/v1/matcher", { query });
        return response.data as { success: boolean; message: string; data: MatchedDevice[] };
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        throw new Error(axiosError.response?.data?.message || "Failed to find matching devices");
    }
};
