"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/api/auth";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError((err as { message?: string })?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Check your email</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          If <span className="text-white">{email}</span> is registered with IdleLink, we&apos;ve sent a 6-digit
          reset code to it. Enter it on the next page.
        </p>
        <Link
          href={`/reset-password?email=${encodeURIComponent(email)}`}
          className="inline-block w-full py-3 bg-[#a78bfa] hover:bg-[#9270ee] text-[#0c0d16] font-semibold text-sm rounded-lg transition-colors"
        >
          Enter Reset Code
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-2">Forgot password?</h2>
      <p className="text-sm text-gray-400 mb-8">Enter your email and we&apos;ll send you a reset code.</p>

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
            placeholder="name@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#13141f] border border-white/[0.08] hover:border-white/[0.15] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#a78bfa] hover:bg-[#9270ee] active:bg-[#7c5cf6] text-[#0c0d16] font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        >
          {loading ? "Sending…" : "Send Reset Code"}
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
