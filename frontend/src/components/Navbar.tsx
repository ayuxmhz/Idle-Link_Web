"use client";

import Link from "next/link";
import { useUser } from "@/app/context/UserContext";

export default function Navbar() {
  const { user, loading } = useUser();

  return (
    <nav className="flex items-center justify-between px-6 md:px-14 py-4 border-b border-white/5">
      <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
        <img
          src="/logo.png"
          alt="IdleLink Logo"
          width="24"
          height="24"
          className="object-contain"
        />
        <span className="text-white">IdleLink</span>
      </Link>

      <div className="flex items-center gap-4">
        {loading ? (
          <div className="w-5 h-5 border-2 border-t-transparent border-purple-500 rounded-full animate-spin"></div>
        ) : user ? (
          <Link
            href={user.role === 'admin' ? '/admin' : '/dashboard'}
            className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-md transition-colors font-medium border border-white/10"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors font-medium"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}