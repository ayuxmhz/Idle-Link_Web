"use client";

import { useUser } from "@/app/context/UserContext";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { ArrowLeft, User2, CheckCircle2, AlertCircle, Send, ShieldCheck } from "lucide-react";

type ProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export default function EditProfilePage() {
  const { user, fetchUser, loading } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // OTP Email Verification states
  const [verifyEmailSending, setVerifyEmailSending] = useState(false);
  const [verifyEmailMsg, setVerifyEmailMsg] = useState("");
  const [emailOtpActive, setEmailOtpActive] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [verifyEmailError, setVerifyEmailError] = useState("");
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  // OTP Phone Verification states
  const [verifyPhoneSending, setVerifyPhoneSending] = useState(false);
  const [verifyPhoneMsg, setVerifyPhoneMsg] = useState("");
  const [phoneOtpActive, setPhoneOtpActive] = useState(false);
  const [phoneOtpCode, setPhoneOtpCode] = useState("");
  const [verifyPhoneError, setVerifyPhoneError] = useState("");
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm<ProfileFormData>();
  const watchedEmail = watch("email");
  const watchedPhone = watch("phoneNumber");

  const emailChanged = user && watchedEmail !== undefined && watchedEmail !== user.email;
  const phoneChanged = user && watchedPhone !== undefined && watchedPhone !== (user.phoneNumber ?? "");

  useEffect(() => {
    if (user) {
      setValue("firstName", user.firstName || "");
      setValue("lastName", user.lastName || "");
      setValue("email", user.email || "");
      setValue("phoneNumber", user.phoneNumber || "");
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

      if (data.email !== user?.email) {
        formData.append("email", data.email);
      }
      if (data.phoneNumber !== (user?.phoneNumber ?? "")) {
        formData.append("phoneNumber", data.phoneNumber);
      }

      const token = Cookies.get("auth_token");
      await axios.put("/api/v1/auth/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });

      const changed = [];
      if (emailChanged) changed.push("email");
      if (phoneChanged) changed.push("phone number");

      if (changed.length > 0) {
        setMessage(`Profile updated! Your new ${changed.join(" and ")} will need to be verified.`);
      } else {
        setMessage("Profile details updated successfully!");
      }
      setVerifyEmailMsg("");
      setVerifyPhoneMsg("");
      setEmailOtpActive(false);
      setPhoneOtpActive(false);
      await fetchUser();
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
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
    } catch (err: any) {
      setVerifyEmailError(err.response?.data?.message || "Failed to send verification code.");
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
    } catch (err: any) {
      setVerifyEmailError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setVerifyingEmail(false);
    }
  };

  const sendPhoneVerification = async () => {
    setVerifyPhoneSending(true);
    setVerifyPhoneMsg("");
    setVerifyPhoneError("");
    try {
      const token = Cookies.get("auth_token");
      const res = await axios.post("/api/v1/auth/send-verification-phone", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const devCode = res.data?.data?.devCode;
      setVerifyPhoneMsg(`Verification code sent! ${devCode ? `(Dev Code: ${devCode})` : "Check your SMS."}`);
      setPhoneOtpActive(true);
    } catch (err: any) {
      setVerifyPhoneError(err.response?.data?.message || "Failed to send verification code.");
    } finally {
      setVerifyPhoneSending(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!phoneOtpCode.trim()) return;
    setVerifyingPhone(true);
    setVerifyPhoneError("");
    try {
      const token = Cookies.get("auth_token");
      await axios.post("/api/v1/auth/verify-phone", { code: phoneOtpCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVerifyPhoneMsg("");
      setPhoneOtpActive(false);
      setMessage("Phone number verified successfully!");
      await fetchUser();
    } catch (err: any) {
      setVerifyPhoneError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setVerifyingPhone(false);
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
                Saving a new email will require re-verification.
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Phone Number
              </label>
              {!phoneChanged && user?.phoneNumber && user?.isPhoneVerified && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="+977 9800000000"
                {...register("phoneNumber")}
                className="flex-1 p-3 bg-[#0c0d16] border border-[#2a2b36] rounded-lg focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] text-white placeholder-gray-600 transition-all"
              />
              {/* Show Verify button only when phone exists, is saved, not verified, not changed */}
              {!phoneChanged && user?.phoneNumber && !user?.isPhoneVerified && !phoneOtpActive && (
                <button
                  type="button"
                  onClick={sendPhoneVerification}
                  disabled={verifyPhoneSending}
                  className="px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-60"
                >
                  <Send size={13} />
                  {verifyPhoneSending ? "Sending…" : "Verify"}
                </button>
              )}
            </div>

            {/* Phone OTP Code Entry Section */}
            {phoneOtpActive && (
              <div className="mt-3 p-4 bg-[#0c0d16] border border-orange-500/20 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-orange-400 uppercase tracking-wider">
                    Enter SMS OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setPhoneOtpActive(false)}
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
                    value={phoneOtpCode}
                    onChange={(e) => setPhoneOtpCode(e.target.value)}
                    className="flex-1 p-2 bg-[#16171f] border border-[#2a2b36] rounded text-center font-mono text-lg tracking-widest focus:outline-none focus:border-orange-500 text-white"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPhoneCode}
                    disabled={verifyingPhone || !phoneOtpCode.trim()}
                    className="px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white text-xs font-bold rounded flex items-center gap-1 transition-all disabled:opacity-60"
                  >
                    <ShieldCheck size={14} />
                    {verifyingPhone ? "Verifying…" : "Confirm"}
                  </button>
                </div>
                {verifyPhoneError && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle size={11} /> {verifyPhoneError}
                  </p>
                )}
              </div>
            )}

            {verifyPhoneMsg && (
              <p className="mt-1.5 text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={11} /> {verifyPhoneMsg}
              </p>
            )}
            {phoneChanged && (
              <p className="mt-1.5 text-[11px] text-orange-400 flex items-center gap-1">
                <AlertCircle size={11} />
                Saving a new phone number will require verification.
              </p>
            )}
            {!user?.phoneNumber && !phoneChanged && (
              <p className="mt-1.5 text-[11px] text-gray-500">
                Adding a phone number allows SMS-based verification and recovery.
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
