"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";

export default function PasswordUpdatePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
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
      
      setMessage("Password updated successfully!");
      reset(); // clear form
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111218] text-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-[#2a2b36]">
        <Link 
          href="/profile" 
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
            <input
              type="password"
              {...register("currentPassword", { required: true })}
              className="w-full p-3 bg-[#0c0d16] border border-[#2a2b36] rounded-lg focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] text-white transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              New Password
            </label>
            <input
              type="password"
              {...register("newPassword", { required: true, minLength: 6 })}
              className="w-full p-3 bg-[#0c0d16] border border-[#2a2b36] rounded-lg focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] text-white transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              {...register("confirmPassword", { required: true })}
              className="w-full p-3 bg-[#0c0d16] border border-[#2a2b36] rounded-lg focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] text-white transition-all"
              placeholder="••••••••"
            />
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
