import axiosInstance from "./axios-instance";
import { API } from "./endpoints";
import { AxiosError } from "axios";

export interface DeviceSpecs {
    cpu: string;
    ramGB: number;
    gpu: string;
    storageGB: number;
}

export interface Device {
    _id: string;
    owner: string;
    ownerUsername?: string;
    ownerProfilePicture?: string;
    name: string;
    type: "GPU" | "CPU" | "ML-Ready" | "Gaming";
    specs: DeviceSpecs;
    hourlyRate: number;
    status: "live" | "offline";
    uptimePercent: number;
    hasActiveBooking?: boolean;
    avgRating?: number | null;
    ratingCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ListDevicesParams {
    owner?: "me" | string;
    type?: string;
    status?: string;
    sort?: string;
    search?: string;
    page?: number;
    limit?: number;
}

const extractMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(axiosError.response?.data?.message || fallback);
};

export const listDevices = async (params: ListDevicesParams = {}) => {
    try {
        const response = await axiosInstance.get(API.DEVICES.BASE, { params });
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to fetch devices");
    }
};

export const createDevice = async (data: {
    name: string;
    type: Device["type"];
    specs: DeviceSpecs;
    hourlyRate: number;
}) => {
    try {
        const response = await axiosInstance.post(API.DEVICES.BASE, data);
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to create device");
    }
};

export const updateDevice = async (id: string, data: Partial<{
    name: string;
    hourlyRate: number;
    status: Device["status"];
    specs: Partial<DeviceSpecs>;
}>) => {
    try {
        const response = await axiosInstance.put(`${API.DEVICES.BASE}/${id}`, data);
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to update device");
    }
};

export const deleteDevice = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`${API.DEVICES.BASE}/${id}`);
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to delete device");
    }
};
