import axios from "axios";
import Cookies from "js-cookie";

const BACKEND_PORT = "8089";

// A hardcoded "localhost" backend URL only works when the browser and the
// backend are the same machine. When the app is opened from another device
// on the network (e.g. a phone, via the dev server's LAN IP), "localhost"
// resolves to that phone, not this machine — so instead we default to
// whatever host the browser actually used to load the page, just swapping
// in the backend's port. NEXT_PUBLIC_API_BASE_URL still wins if set
// explicitly (e.g. for a production deployment with a different domain).
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
    || (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:${BACKEND_PORT}` : `http://localhost:${BACKEND_PORT}`);

// Locally-uploaded pictures are stored as a relative "/uploads/..." path and
// need the backend origin prepended. Google avatars (and any other externally
// hosted picture) are already absolute URLs and must be used as-is.
export const resolveImageUrl = (path?: string | null): string | null => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_BASE_URL}${path}`;
};

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = Cookies.get("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;