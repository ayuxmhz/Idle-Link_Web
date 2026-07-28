"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Sparkles, Archive, CalendarClock, BarChart2, Wallet, Settings, HelpCircle, FileText, Shield, LogOut, X } from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import { useSidebar } from "@/components/SidebarContext";

export default function Sidebar() {
  const { user, logout } = useUser();
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard" },
    { name: "Marketplace", icon: <ShoppingCart size={18} />, href: "/dashboard/marketplace" },
    { name: "Matcher", icon: <Sparkles size={18} />, href: "/dashboard/matcher" },
    { name: "Inventory", icon: <Archive size={18} />, href: "/dashboard/inventory" },
    { name: "Bookings", icon: <CalendarClock size={18} />, href: "/dashboard/bookings" },
    { name: "Wallet", icon: <Wallet size={18} />, href: "/dashboard/wallet" },
    { name: "Analytics", icon: <BarChart2 size={18} />, href: "/dashboard/analytics" },
    { name: "Settings", icon: <Settings size={18} />, href: "/profile" },
  ];

  if (user?.role === "admin") {
    menuItems.push({ name: "Admin Panel", icon: <Shield size={18} />, href: "/admin/users" });
  }

  return (
    <aside
      className={`w-[260px] h-screen bg-[#11121a] border-r border-[#262736] flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      {/* Logo */}
      <div className="p-6 flex items-start justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-1">
            <Image
              src="/logo.png"
              alt="IdleLink Logo"
              width={24}
              height={24}
              className="object-contain"
            />
            <h1 className="text-2xl font-bold text-[#c9c5f8] tracking-tight leading-none">IdleLink</h1>
          </Link>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Compute Marketplace</p>
        </div>
        <button
          onClick={close}
          className="lg:hidden text-gray-500 hover:text-white transition-colors p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Menu */}
      <div className="px-4 py-2 flex-1 flex flex-col gap-1">
        {menuItems.map((item) => {
          // Exact match for /dashboard, prefix match for everything else
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : item.href !== "#" && pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={close}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#252538] text-white"
                  : "text-gray-400 hover:bg-[#1a1b25] hover:text-white"
              }`}
            >
              <span className={isActive ? "text-[#a39dfa]" : "text-gray-500"}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}

        <div className="mt-8 px-2">
          <Link
            href="/dashboard/marketplace"
            onClick={close}
            className="w-full py-3 bg-[#cbbefa] hover:bg-[#b8abeb] text-[#2c2057] text-sm font-bold rounded-lg transition-colors flex items-center justify-center"
          >
            Deploy Instance
          </Link>
        </div>
      </div>

      {/* Bottom Menu */}
      <div className="p-4 border-t border-[#262736] flex flex-col gap-1">
        <Link
          href="/support"
          onClick={close}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-400 hover:bg-[#1a1b25] hover:text-white transition-colors"
        >
          <HelpCircle size={18} className="text-gray-500" />
          Support
        </Link>
        <Link
          href="/documentation"
          onClick={close}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-400 hover:bg-[#1a1b25] hover:text-white transition-colors"
        >
          <FileText size={18} className="text-gray-500" />
          Documentation
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-[#1a1b25] hover:text-white rounded-lg transition-colors w-full text-left"
        >
          <LogOut size={18} className="text-gray-500" />
          Logout
        </button>
      </div>
    </aside>
  );
}
