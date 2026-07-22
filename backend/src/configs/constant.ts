import dotenv from "dotenv";
dotenv.config(); // implement .env file

// Add fallback value from env for stability
export const PORT: number = Number(process.env.PORT) || 8089; // default port is 8089
export const MONGODB_URL: string =
    process.env.MONGODB_URL || "mongodb://localhost:27017/class-36a-db"; // default MongoDB URL
export const SECRET_KEY: string =
    process.env.SECRET_KEY || "merosecretkey";

export const FRONTEND_URL: string =
    process.env.FRONTEND_URL || "http://localhost:3000";

// eSewa ePay v2 — defaults to eSewa's own published test/sandbox credentials
// (no signup needed). Never use these defaults in a real deployment.
export const ESEWA_MERCHANT_CODE: string =
    process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
export const ESEWA_SECRET_KEY: string =
    process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
export const ESEWA_PAYMENT_URL: string =
    process.env.ESEWA_PAYMENT_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
export const ESEWA_STATUS_URL: string =
    process.env.ESEWA_STATUS_URL || "https://rc.esewa.com.np/api/epay/transaction/status/";

// AI Job Matcher (Google GenAI / Gemini). Empty by default — the matcher
// endpoint returns a clear "not configured" error until this is set.
export const GEMINI_API_KEY: string = process.env.GEMINI_API_KEY || "";

// Transactional email (Resend). Empty by default — falls back to logging the
// code to the console instead of failing the request when unset.
export const RESEND_API_KEY: string = process.env.RESEND_API_KEY || "";
export const RESEND_FROM_EMAIL: string =
    process.env.RESEND_FROM_EMAIL || "IdleLink <onboarding@resend.dev>";