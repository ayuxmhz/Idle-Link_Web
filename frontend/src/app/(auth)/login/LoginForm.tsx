"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "./schema";
import Link from "next/link";
import { useState } from "react";
import { handleLoginUser } from "@/lib/actions/auth-action";
import { Eye, EyeOff } from "lucide-react";
import Cookies from "js-cookie";
import { useUser } from "@/app/context/UserContext";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const result = await handleLoginUser(data);
      if (result.success) {
        const { token, user } = result.data;
        // Set cookies on client-side immediately so they're available
        // on the next page load (the server action also sets them, but
        // the Set-Cookie header may not be processed by the browser yet).
        Cookies.set("auth_token", token, { path: "/" });
        Cookies.set("user_data", JSON.stringify(user), { path: "/" });
        // Set user directly in context from the login response instead
        // of calling fetchUser() which makes a second /whoami request
        // that can intermittently fail and leave the context null.
        setUser(user);
        // Intentional hard navigation (not router.push) — a full page load
        // ensures the dashboard's server-rendered shell picks up the fresh
        // auth cookie immediately instead of racing a client-side transition.
        // eslint-disable-next-line react-hooks/immutability
        window.location.href = user.role === "admin" ? "/admin" : "/dashboard";
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      const errorMsg = (err as { message?: string })?.message || "Login failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex bg-[#1a1b2e] rounded-lg p-1 mb-8">
        <span className="flex-1 py-2 text-sm font-medium text-white bg-[#2a2b3f] rounded-md text-center cursor-default">
          Log In
        </span>
        <Link
          href="/register"
          className="flex-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-300 text-center rounded-md transition-colors"
        >
          Sign Up
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            className="w-full bg-[#13141f] border border-white/[0.08] hover:border-white/[0.15] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-widest">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
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
          {errors.password && (
            <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full py-3 bg-[#a78bfa] hover:bg-[#9270ee] active:bg-[#7c5cf6] text-[#0c0d16] font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        >
          {loading ? "Logging in…" : "Log In"}
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