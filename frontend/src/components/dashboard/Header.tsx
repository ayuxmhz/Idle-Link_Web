"use client";

import { Bell, UserCircle } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/app/context/UserContext";
import Image from "next/image";

export default function Header() {
  const { user } = useUser();

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-[#262736] bg-[#11121a]">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Home</h2>
        <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-gray-400 border border-[#3b3c4a] rounded-full">
          Seller
        </span>
      </div>

      <div className="flex items-center gap-6">
        <button className="px-4 py-2 text-sm text-gray-300 border border-[#2a2b36] hover:bg-[#1a1b25] rounded-lg transition-colors">
          Switch to Buyer
        </button>
        <button className="text-gray-400 hover:text-white transition-colors relative">
          <Bell size={20} />
          {/* Notification dot can go here if needed */}
        </button>
        <Link href="/profile" className="text-gray-400 hover:text-white transition-colors overflow-hidden rounded-full w-8 h-8 flex items-center justify-center">
          {user?.profilePicture ? (
            <Image 
              src={`http://localhost:8089${user.profilePicture}`} 
              alt="Profile" 
              width={32} 
              height={32} 
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <UserCircle size={28} />
          )}
        </Link>
      </div>
    </header>
  );
}
