"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "./schema";
import Link from "next/link";

const inputClass =
  "w-full bg-[#13141f] border border-white/[0.08] hover:border-white/[0.15] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all";

const labelClass =
  "block text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-2";

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    console.log("Register:", data);
    // TODO: wire up your API call here
  };

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex bg-[#1a1b2e] rounded-lg p-1 mb-8">
        <Link
          href="/login"
          className="flex-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-300 text-center rounded-md transition-colors"
        >
          Log In
        </Link>
        <span className="flex-1 py-2 text-sm font-medium text-white bg-[#2a2b3f] rounded-md text-center cursor-default">
          Sign Up
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* First + Last name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>First Name</label>
            <input
              type="text"
              placeholder="John"
              autoComplete="given-name"
              className={inputClass}
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input
              type="text"
              placeholder="Doe"
              autoComplete="family-name"
              className={inputClass}
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Username */}
        <div>
          <label className={labelClass}>Username</label>
          <input
            type="text"
            placeholder="johndoe"
            autoComplete="username"
            className={inputClass}
            {...register("username")}
          />
          {errors.username && (
            <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>Email Address</label>
          <input
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            className={inputClass}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className={labelClass}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className={inputClass}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className={labelClass}>Confirm Password</label>
          <input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className={inputClass}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-[#a78bfa] hover:bg-[#9270ee] active:bg-[#7c5cf6] text-[#0c0d16] font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        >
          {isSubmitting ? "Creating account…" : "Create Account"}
        </button>

        {/* OR */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-white/[0.07]" />
          <span className="text-gray-600 text-xs tracking-widest">OR</span>
          <div className="flex-1 h-px bg-white/[0.07]" />
        </div>

        {/* Google */}
        <button
          type="button"
          className="w-full py-3 bg-[#13141f] border border-white/[0.08] hover:border-white/[0.18] text-white text-sm rounded-lg flex items-center justify-center gap-3 transition-all"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}