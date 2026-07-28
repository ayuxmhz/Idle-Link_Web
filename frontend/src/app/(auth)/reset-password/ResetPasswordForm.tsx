"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/api/auth";
import { Eye, EyeOff } from "lucide-react";
import { passwordSchema, PASSWORD_HINT } from "@/lib/passwordSchema";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    const parsed = passwordSchema.safeParse(newPassword);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, code, newPassword);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError((err as { message?: string })?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-3">
        <h2 className="text-xl font-bold text-white">Password reset!</h2>
        <p className="text-sm text-gray-400">Redirecting you to log in…</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-2">Reset your password</h2>
      <p className="text-sm text-gray-400 mb-8">Enter the code we emailed you along with a new password.</p>

      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#13141f] border border-white/[0.08] hover:border-white/[0.15] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-2">
            6-Digit Code
          </label>
          <input
            type="text"
            required
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-[#13141f] border border-white/[0.08] hover:border-white/[0.15] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm tracking-[0.3em] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#13141f] border border-white/[0.08] hover:border-white/[0.15] text-white placeholder-gray-600 rounded-lg pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-gray-600 text-xs mt-1.5">{PASSWORD_HINT}</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#a78bfa] hover:bg-[#9270ee] active:bg-[#7c5cf6] text-[#0c0d16] font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        >
          {loading ? "Resetting…" : "Reset Password"}
        </button>

        <Link
          href="/login"
          className="block text-center text-xs text-gray-500 hover:text-purple-400 transition-colors"
        >
          Back to Log In
        </Link>
      </form>
    </div>
  );
}
