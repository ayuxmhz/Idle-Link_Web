"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { clearAuthCookies } from "@/lib/cookies";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      await clearAuthCookies();
      router.push("/");
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="px-5 py-2.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-sm font-medium rounded-lg transition-all disabled:opacity-50 cursor-pointer"
    >
      {isPending ? "Logging out..." : "Log Out"}
    </button>
  );
}
