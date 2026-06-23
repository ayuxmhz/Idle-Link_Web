"use client";

import { useUser } from "../../../context/UserContext";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { ArrowLeft, User2 } from "lucide-react";

type ProfileFormData = {
  firstName: string;
  lastName: string;
};

export default function EditProfilePage() {
  const { user, fetchUser, loading } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { register, handleSubmit, setValue } = useForm<ProfileFormData>();

  useEffect(() => {
    if (user) {
      setValue("firstName", user.firstName || "");
      setValue("lastName", user.lastName || "");
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      // We don't append profilePicture here, the main profile page handles it

      const token = Cookies.get("auth_token");
      await axios.put("/api/v1/auth/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      
      setMessage("Profile details updated successfully!");
      await fetchUser(); // refresh user data
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111218] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#cbbefa] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            <User2 size={20} className="text-[#cbbefa]" />
            Edit Profile
          </h1>
          <p className="text-xs text-gray-500">Update your personal information</p>
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
              First Name
            </label>
            <input
              type="text"
              {...register("firstName", { required: true })}
              className="w-full p-3 bg-[#0c0d16] border border-[#2a2b36] rounded-lg focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Last Name
            </label>
            <input
              type="text"
              {...register("lastName", { required: true })}
              className="w-full p-3 bg-[#0c0d16] border border-[#2a2b36] rounded-lg focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] text-white transition-all"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Email (Read Only)
            </label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full p-3 bg-[#111218] border border-[#2a2b36] rounded-lg focus:outline-none text-gray-500 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-4 bg-[#cbbefa] hover:bg-[#b8abeb] text-[#2c2057] font-bold rounded-lg disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
