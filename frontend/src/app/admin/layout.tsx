"use client";

import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import Cookies from "js-cookie";
import { Menu } from "lucide-react";
import { SidebarProvider, useSidebar } from "@/components/SidebarContext";

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
    (async () => {
      // Wait until context has finished loading before deciding to redirect.
      if (!loading) {
        setCheckedCookie(true);
        if (!isAdmin) {
          router.push("/"); // redirect non-admins
        }
      }
    })();
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
    <SidebarProvider>
      <AdminShell>{children}</AdminShell>
    </SidebarProvider>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { isOpen, toggle, close } = useSidebar();

  return (
    <div className="min-h-screen bg-[#111218] text-white flex font-sans">
      <AdminSidebar />
      {isOpen && (
        <div
          onClick={close}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}
      <div className="flex-1 w-full lg:ml-[260px] min-w-0">
        {/* Mobile-only top bar — admin pages don't share a Header component like the user dashboard does */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[#262736] bg-[#11121a]">
          <button onClick={toggle} className="text-gray-400 hover:text-white transition-colors">
            <Menu size={22} />
          </button>
          <span className="text-sm font-bold text-white">IdleLink Admin</span>
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
}
