import axiosInstance from "./axios-instance";
import { API } from "./endpoints";
import { RegisterFormData } from "@/app/(auth)/register/schema";
import { LoginFormData } from "@/app/(auth)/login/schema";
import { AxiosError } from "axios";

export const register = async (data: RegisterFormData) => {
    try {
        const response =
            await axiosInstance.post(API.AUTH.REGISTER, data);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        throw new Error(axiosError.response?.data?.message || 'Registration failed');
    }
}

export const login = async (data: LoginFormData) => {
    try {
        const response =
            await axiosInstance.post(API.AUTH.LOGIN, data);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        throw new Error(axiosError.response?.data?.message || 'Login failed');
    }
}

export const googleAuth = async (accessToken: string) => {
    try {
        const response =
            await axiosInstance.post(API.AUTH.GOOGLE, { accessToken });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        throw new Error(axiosError.response?.data?.message || 'Google sign-in failed');
    }
}

export const forgotPassword = async (email: string) => {
    try {
        const response =
            await axiosInstance.post(API.AUTH.FORGOT_PASSWORD, { email });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        throw new Error(axiosError.response?.data?.message || 'Failed to send reset code');
    }
}

export const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
        const response =
            await axiosInstance.post(API.AUTH.RESET_PASSWORD, { email, code, newPassword });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        throw new Error(axiosError.response?.data?.message || 'Failed to reset password');
    }
}