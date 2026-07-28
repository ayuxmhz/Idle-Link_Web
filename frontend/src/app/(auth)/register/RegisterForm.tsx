"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "./schema";
import { PASSWORD_HINT } from "@/lib/passwordSchema";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { handleRegisterUser } from "@/lib/actions/auth-action";
import { Eye, EyeOff } from "lucide-react";

const inputClass =
  "w-full bg-[#13141f] border border-white/[0.08] hover:border-white/[0.15] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all";

const labelClass =
  "block text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-2";

export default function RegisterForm() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    setError("");
    startTransition(async () => {
      try {
        const result = await handleRegisterUser(data);
        if (result.success) {
          router.push("/login");
        } else {
          setError(result.message || "Registration failed");
        }
      } catch (err) {
        const errorMsg = (err as { message?: string })?.message || "Registration failed";
        setError(errorMsg);
      }
    });
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
        {error && (
          <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* First + Last name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>First Name</label>
            <input
              type="text"
              placeholder="Enter First name"
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
              placeholder="Enter Last Name"
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
            placeholder="Enter username"
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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full bg-[#13141f] border border-white/[0.08] hover:border-white/[0.15] text-white placeholder-gray-600 rounded-lg pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password ? (
            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
          ) : (
            <p className="text-gray-600 text-xs mt-1">{PASSWORD_HINT}</p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className={labelClass}>Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full bg-[#13141f] border border-white/[0.08] hover:border-white/[0.15] text-white placeholder-gray-600 rounded-lg pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className="w-full py-3 bg-[#a78bfa] hover:bg-[#9270ee] active:bg-[#7c5cf6] text-[#0c0d16] font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        >
          {isPending ? "Creating account…" : "Create Account"}
        </button>

        {/* OR */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-white/[0.07]" />
          <span className="text-gray-600 text-xs tracking-widest">OR</span>
          <div className="flex-1 h-px bg-white/[0.07]" />
        </div>

        {/* Google */}
        <GoogleSignInButton />
      </form>
    </div>
  );
}