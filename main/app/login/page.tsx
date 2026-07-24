"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid username or password");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F3F0EB] text-[#0B0B0D]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Warm architectural glow */}
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#A26028]/[0.06] blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-black/[0.035] blur-3xl" />

        {/* Architectural circles */}
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full border border-black/[0.04]" />

        <div className="absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full border border-[#A26028]/10" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Main */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-[460px]">
          {/* Logo */}
          <div className="mb-10 flex justify-center">
            <Image
              src="/logo.png"
              alt="BSL Construction"
              width={280}
              height={140}
              priority
              className="h-auto w-[240px] object-contain"
            />
          </div>

          {/* Login card */}
          <div className="relative overflow-hidden rounded-3xl border border-black/[0.07] bg-white p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.2)] sm:p-10">
            {/* Top accent */}
            <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#A26028] to-transparent" />

            {/* Header */}
            <div className="mb-8 text-center">
              <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#A26028]">
                BSL Construction
              </p>

              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#0B0B0D]">
                Welcome back
              </h1>

              <p className="mt-3 text-sm leading-6 text-black/50">
                Sign in to access your management dashboard.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-black/60"
                >
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                  className="h-14 w-full rounded-xl border border-black/10 bg-[#F8F7F4] px-4 text-sm text-[#0B0B0D] outline-none transition-all placeholder:text-black/30 focus:border-[#A26028] focus:bg-white focus:ring-1 focus:ring-[#A26028]/30"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-black/60"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-14 w-full rounded-xl border border-black/10 bg-[#F8F7F4] px-4 text-sm text-[#0B0B0D] outline-none transition-all placeholder:text-black/30 focus:border-[#A26028] focus:bg-white focus:ring-1 focus:ring-[#A26028]/30"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative mt-3 flex h-14 w-full items-center justify-center overflow-hidden rounded-xl bg-[#0B0B0D] text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:bg-[#A26028] hover:shadow-[0_15px_40px_-15px_rgba(162,96,40,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In

                      <svg
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-black/10" />

              <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-black/30">
                Secure Access
              </span>

              <div className="h-px flex-1 bg-black/10" />
            </div>

            <p className="mt-5 text-center text-xs text-black/30">
              BSL Construction Management Portal
            </p>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-black/30">
            © {new Date().getFullYear()} BSL Construction. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}