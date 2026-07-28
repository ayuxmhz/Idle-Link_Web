"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, Eye, EyeOff } from "lucide-react";
import { passwordSchema, PASSWORD_HINT } from "@/lib/passwordSchema";

export default function AdminPasswordUpdatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }

  const { register, handleSubmit, reset } = useForm<PasswordFormData>();

  const onSubmit = async (data: PasswordFormData) => {
    const parsed = passwordSchema.safeParse(data.newPassword);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (data.newPassword !== data.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const token = Cookies.get("auth_token");
      await axios.put(
        "/api/v1/auth/update-password",
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setMessage("Password updated successfully! Redirecting…");
      reset(); // clear form
      setTimeout(() => router.push("/admin/settings"), 1500);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111218] text-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-[#2a2b36]">
        <Link 
          href="/admin/settings" 
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1a1b25] hover:bg-[#22233a] border border-[#2a2b36] text-gray-400 hover:text-white transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <KeyRound size={20} className="text-[#cbbefa]" />
            Change Password
          </h1>
          <p className="text-xs text-gray-500">Update your account security</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-6 mt-6">
        {message && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium">
            ✓ {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-[#16171f] border border-[#2a2b36] rounded-xl p-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                {...register("currentPassword", { required: true })}
                className="w-full p-3 pr-11 bg-[#0c0d16] border border-[#2a2b36] rounded-lg focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] text-white transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                {...register("newPassword", { required: true })}
                className="w-full p-3 pr-11 bg-[#0c0d16] border border-[#2a2b36] rounded-lg focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] text-white transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-1.5">{PASSWORD_HINT}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                {...register("confirmPassword", { required: true })}
                className="w-full p-3 pr-11 bg-[#0c0d16] border border-[#2a2b36] rounded-lg focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] text-white transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-4 bg-[#cbbefa] hover:bg-[#b8abeb] text-[#2c2057] font-bold rounded-lg disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
