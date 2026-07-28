import axiosInstance from "./axios-instance";
import { API } from "./endpoints";
import { AxiosError } from "axios";

export interface Transaction {
    _id: string;
    user: string;
    booking?: string;
    type: "job_payment" | "commission" | "deposit" | "withdrawal";
    amount: number;
    description: string;
    createdAt: string;
}

export interface EarningsSummary {
    todayTotal: number;
    weekTotal: number;
    dailyBreakdown: { day: string; total: number }[];
}

const extractMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(axiosError.response?.data?.message || fallback);
};

export const listMyTransactions = async (params: { page?: number; limit?: number } = {}) => {
    try {
        const response = await axiosInstance.get(API.TRANSACTIONS.BASE, { params });
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to fetch transactions");
    }
};

export const getSummary = async (range: string = "week") => {
    try {
        const response = await axiosInstance.get(API.TRANSACTIONS.SUMMARY, { params: { range } });
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to fetch earnings summary");
    }
};

export const deposit = async (amount: number) => {
    try {
        const response = await axiosInstance.post(API.TRANSACTIONS.DEPOSIT, { amount });
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to deposit funds");
    }
};

export const withdraw = async (amount: number, destination: string) => {
    try {
        const response = await axiosInstance.post(API.TRANSACTIONS.WITHDRAW, { amount, destination });
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to withdraw funds");
    }
};
