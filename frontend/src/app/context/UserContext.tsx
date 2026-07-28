"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { clearAuthCookies } from "@/lib/cookies";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  profilePicture?: string;
  coverColor?: string;
  coverImage?: string;
  role: string;
  phoneNumber?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  walletBalance?: number;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = Cookies.get("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await axios.get("/api/v1/auth/whoami", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(response.data.data);
    } catch (error) {
      console.error("Error fetching user", error);
      // Only clear auth cookies on 401 (token invalid/expired).
      // For 500 or network errors, keep the session — a backend hiccup
      // should not force the user to re-login.
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        Cookies.remove("auth_token");
        Cookies.remove("user_data");
        await clearAuthCookies();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      // Synchronously try to load user from cookie on mount to avoid layout flashes
      try {
        const raw = Cookies.get("user_data");
        if (raw) {
          setUser(JSON.parse(raw));
        }
      } catch (e) {
        console.error("Error parsing user_data cookie on mount", e);
      }
      await fetchUser();
    })();
  }, []);

  const logout = async () => {
    Cookies.remove("auth_token");
    Cookies.remove("user_data");
    await clearAuthCookies();
    // Intentionally omitting setUser(null) here.
    // If we set it to null, React will instantly re-render the page showing
    // placeholder data ("User", "@") for a split second before the browser 
    // redirects to /login. Since we are doing a hard redirect anyway, leaving
    // the user state intact prevents the flicker.
    window.location.href = "/login";
  };


  return (
    <UserContext.Provider value={{ user, loading, fetchUser, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
