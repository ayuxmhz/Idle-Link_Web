"use client";

import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import Cookies from "js-cookie";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [checkedCookie, setCheckedCookie] = useState(false);

  // Determine admin status from context OR the cookie fallback.
  // On a hard redirect (window.location.href = "/admin"), the UserProvider
  // re-initializes and fetchUser()/whoami may be slow or fail. Reading
  // the cookie bridges this gap so the admin page doesn't flash-redirect.
  const isAdmin = (() => {
    if (user) return user.role === "admin";
    try {
      const raw = Cookies.get("user_data");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?.role === "admin";
      }
    } catch { /* ignore parse errors */ }
    return false;
  })();

  useEffect(() => {
    // Wait until context has finished loading before deciding to redirect.
    if (!loading) {
      setCheckedCookie(true);
      if (!isAdmin) {
        router.push("/"); // redirect non-admins
      }
    }
  }, [user, loading, router, isAdmin]);

  if (loading || (!checkedCookie && !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111218]">
        <div className="w-8 h-8 border-4 border-t-transparent border-[#a39dfa] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111218]">
        <div className="w-8 h-8 border-4 border-t-transparent border-[#a39dfa] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111218] text-white flex font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-[260px]">
        {children}
      </main>
    </div>
  );
}
