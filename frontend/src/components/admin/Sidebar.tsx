"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Server,
  FileText,
  Settings,
  LogOut,
  X
} from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import { useSidebar } from "@/components/SidebarContext";

export default function AdminSidebar() {
  const { logout } = useUser();
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  const menuItems = [
    { name: "Overview", icon: <LayoutDashboard size={18} />, href: "/admin" },
    { name: "Users", icon: <Users size={18} />, href: "/admin/users" },
    { name: "Transactions", icon: <CreditCard size={18} />, href: "/admin/transactions" },
    { name: "Nodes", icon: <Server size={18} />, href: "/admin/devices" },
    { name: "Reports", icon: <FileText size={18} />, href: "/admin/reports" },
  ];

  return (
    <aside
      className={`w-[260px] h-screen bg-[#11121a] border-r border-[#262736] flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      {/* Logo */}
      <div className="p-6 pb-2 flex items-start justify-between">
        <div>
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="IdleLink Logo"
              width={24}
              height={24}
              className="object-contain"
            />
            <h1 className="text-xl font-bold text-[#c9c5f8] tracking-tight leading-none">IdleLink</h1>
          </Link>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-3 font-semibold">Admin Portal</p>
        </div>
        <button
          onClick={close}
          className="lg:hidden text-gray-500 hover:text-white transition-colors p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Menu */}
      <div className="px-4 py-4 flex-1 flex flex-col gap-1 mt-2">
        {menuItems.map((item) => {
          // Exact match for /admin, prefix match for /admin/*
          const isActive = 
            item.href === "/admin" 
              ? pathname === "/admin" 
              : pathname.startsWith(item.href) && item.href !== "#";

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
      </div>

      {/* Bottom Menu */}
      <div className="p-4 border-t border-[#262736] flex flex-col gap-1">
        <Link
          href="/admin/settings"
          onClick={close}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            pathname.startsWith("/admin/settings")
              ? "bg-[#252538] text-white"
              : "text-gray-400 hover:bg-[#1a1b25] hover:text-white"
          }`}
        >
          <Settings size={18} className={pathname.startsWith("/admin/settings") ? "text-[#a39dfa]" : "text-gray-500"} />
          Settings
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
