"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useUser } from "@/app/context/UserContext";
import { handleGoogleAuth } from "@/lib/actions/auth-action";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function GoogleSignInButton() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useUser();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    (async () => {
      if (window.google?.accounts?.oauth2) {
        setScriptLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      document.head.appendChild(script);
    })();
  }, []);

  if (!GOOGLE_CLIENT_ID) return null;

  const handleClick = () => {
    if (!scriptLoaded || !window.google || loading) return;
    setError("");
    setLoading(true);

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "email profile",
      callback: async (response) => {
        if (!response.access_token) {
          setError("Google sign-in was cancelled or failed");
          setLoading(false);
          return;
        }
        try {
          const result = await handleGoogleAuth(response.access_token);
          if (result.success) {
            const { token, user } = result.data;
            Cookies.set("auth_token", token, { path: "/" });
            Cookies.set("user_data", JSON.stringify(user), { path: "/" });
            setUser(user);
            window.location.href = user.role === "admin" ? "/admin" : "/dashboard";
          } else {
            setError(result.message || "Google sign-in failed");
          }
        } catch (err) {
          setError((err as { message?: string })?.message || "Google sign-in failed");
        } finally {
          setLoading(false);
        }
      },
    });
    client.requestAccessToken();
  };

  return (
    <div>
      {error && (
        <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 rounded-lg mb-3">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={!scriptLoaded || loading}
        className="w-full py-3 bg-[#13141f] border border-white/[0.08] hover:border-white/[0.18] text-white text-sm rounded-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleIcon />
        {loading ? "Signing in…" : "Continue with Google"}
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
