// centralized path definitions for API endpoints
export const API = {
    AUTH: {
        REGISTER: "/api/v1/auth/register",
        LOGIN: "/api/v1/auth/login",
        FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
        RESET_PASSWORD: "/api/v1/auth/reset-password",
    },
    DEVICES: {
        BASE: "/api/v1/devices",
    },
    BOOKINGS: {
        BASE: "/api/v1/bookings",
    },
    TRANSACTIONS: {
        BASE: "/api/v1/transactions",
        SUMMARY: "/api/v1/transactions/summary",
        DEPOSIT: "/api/v1/transactions/deposit",
        WITHDRAW: "/api/v1/transactions/withdraw",
    },
}