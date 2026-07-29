"use client";

import { useUser } from "@/app/context/UserContext";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { ArrowLeft, User2, CheckCircle2, AlertCircle, Send, ShieldCheck, Palette, ImagePlus, X } from "lucide-react";
import { resolveImageUrl } from "@/lib/api/axios-instance";

const COVER_COLOR_PRESETS = [
  "#2c2057",
  "#7c3aed",
  "#0f766e",
  "#b45309",
  "#be123c",
  "#1d4ed8",
  "#4d7c0f",
  "#111218",
];

type ProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
};

export default function AdminEditProfilePage() {
  const { user, fetchUser, loading } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Profile cover customization
  const [coverColor, setCoverColor] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);

  // OTP Email Verification states
  const [verifyEmailSending, setVerifyEmailSending] = useState(false);
  const [verifyEmailMsg, setVerifyEmailMsg] = useState("");
  const [emailOtpActive, setEmailOtpActive] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [verifyEmailError, setVerifyEmailError] = useState("");
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm<ProfileFormData>();
  // react-hook-form's watch() is a known incompatibility with the React
  // Compiler's memoization analysis — safe here since this component doesn't
  // rely on compiler-inserted memoization for this derived value.
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedEmail = watch("email");

  const emailChanged = user && watchedEmail !== undefined && watchedEmail !== user.email;

  useEffect(() => {
    if (user) {
      setValue("firstName", user.firstName || "");
      setValue("lastName", user.lastName || "");
      setValue("email", user.email || "");
      setCoverColor(user.coverColor || null);
      setCoverImagePreview(user.coverImage ? resolveImageUrl(user.coverImage) : null);
    }
  }, [user, setValue]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
    setRemoveCoverImage(false);
  };

  const handleRemoveCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setRemoveCoverImage(true);
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      if (data.email !== user?.email) {
        formData.append("email", data.email);
      }
      if (coverColor !== (user?.coverColor ?? null)) {
        formData.append("coverColor", coverColor || "");
      }
      if (coverImageFile) {
        formData.append("coverImage", coverImageFile);
      } else if (removeCoverImage && user?.coverImage) {
        formData.append("coverImage", "");
      }

      const token = Cookies.get("auth_token");
      await axios.put("/api/v1/auth/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });

      if (data.email !== user?.email) {
        setMessage("Profile updated! Your new email address will need to be verified.");
      } else {
        setMessage("Profile details updated successfully!");
      }
      setVerifyEmailMsg("");
      setEmailOtpActive(false);
      setCoverImageFile(null);
      setRemoveCoverImage(false);
      await fetchUser();
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendEmailVerification = async () => {
    setVerifyEmailSending(true);
    setVerifyEmailMsg("");
    setVerifyEmailError("");
    try {
      const token = Cookies.get("auth_token");
      const res = await axios.post("/api/v1/auth/send-verification-email", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const devCode = res.data?.data?.devCode;
      setVerifyEmailMsg(`Verification code sent! ${devCode ? `(Dev Code: ${devCode})` : "Check your inbox."}`);
      setEmailOtpActive(true);
    } catch (err) {
      setVerifyEmailError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to send verification code.");
    } finally {
      setVerifyEmailSending(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    if (!emailOtpCode.trim()) return;
    setVerifyingEmail(true);
    setVerifyEmailError("");
    try {
      const token = Cookies.get("auth_token");
      await axios.post("/api/v1/auth/verify-email", { code: emailOtpCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVerifyEmailMsg("");
      setEmailOtpActive(false);
      setMessage("Email address verified successfully!");
      await fetchUser();
    } catch (err) {
      setVerifyEmailError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Invalid or expired code.");
    } finally {
      setVerifyingEmail(false);
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
          href="/admin/settings"
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
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-[#16171f] border border-[#2a2b36] rounded-xl p-6">

          {/* Profile Cover */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Profile Cover
            </label>
            <div
              className="h-20 rounded-lg mb-3 border border-[#2a2b36]"
              style={
                coverImagePreview
                  ? { backgroundImage: `url(${coverImagePreview})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : coverColor
                  ? { backgroundColor: coverColor }
                  : { background: "linear-gradient(to right, #2c2057, #3d2a7a, #1a1b2e)" }
              }
            />
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {COVER_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCoverColor(preset)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    coverColor === preset ? "border-[#cbbefa] scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: preset }}
                  aria-label={`Use color ${preset}`}
                />
              ))}
              <label className="w-7 h-7 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                <Palette size={12} className="text-gray-400" />
                <input
                  type="color"
                  value={coverColor || "#2c2057"}
                  onChange={(e) => setCoverColor(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="px-3 py-2 bg-[#0c0d16] border border-[#2a2b36] hover:border-[#cbbefa] text-gray-300 hover:text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer">
                <ImagePlus size={13} />
                Upload background image
                <input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
              </label>
              {coverImagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveCoverImage}
                  className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <X size={13} />
                  Remove image
                </button>
              )}
            </div>
          </div>

          {/* First Name */}
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

          {/* Last Name */}
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

          {/* Email */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Email Address
              </label>
              {!emailChanged && user?.isEmailVerified && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                {...register("email", { required: true })}
                className="flex-1 p-3 bg-[#0c0d16] border border-[#2a2b36] rounded-lg focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] text-white transition-all"
              />
              {/* Show Verify button only when email is saved & not verified & not changed */}
              {!emailChanged && !user?.isEmailVerified && user?.email && !emailOtpActive && (
                <button
                  type="button"
                  onClick={sendEmailVerification}
                  disabled={verifyEmailSending}
                  className="px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-60"
                >
                  <Send size={13} />
                  {verifyEmailSending ? "Sending…" : "Verify"}
                </button>
              )}
            </div>

            {/* Email OTP Code Entry Section */}
            {emailOtpActive && (
              <div className="mt-3 p-4 bg-[#0c0d16] border border-orange-500/20 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-orange-400 uppercase tracking-wider">
                    Enter Email OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setEmailOtpActive(false)}
                    className="text-[10px] text-gray-500 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={emailOtpCode}
                    onChange={(e) => setEmailOtpCode(e.target.value)}
                    className="flex-1 p-2 bg-[#16171f] border border-[#2a2b36] rounded text-center font-mono text-lg tracking-widest focus:outline-none focus:border-orange-500 text-white"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailCode}
                    disabled={verifyingEmail || !emailOtpCode.trim()}
                    className="px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white text-xs font-bold rounded flex items-center gap-1 transition-all disabled:opacity-60"
                  >
                    <ShieldCheck size={14} />
                    {verifyingEmail ? "Verifying…" : "Confirm"}
                  </button>
                </div>
                {verifyEmailError && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle size={11} /> {verifyEmailError}
                  </p>
                )}
              </div>
            )}

            {verifyEmailMsg && (
              <p className="mt-1.5 text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={11} /> {verifyEmailMsg}
              </p>
            )}
            {emailChanged && (
              <p className="mt-1.5 text-[11px] text-orange-400 flex items-center gap-1">
                <AlertCircle size={11} />
                Saving a new email will mark it as unverified and require re-verification.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-2 bg-[#cbbefa] hover:bg-[#b8abeb] text-[#2c2057] font-bold rounded-lg disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
