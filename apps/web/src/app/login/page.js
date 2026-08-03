"use client";

// Security update: Role selection is managed automatically via Supabase profile RBAC.
import { useId, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import BrandMark from "@/components/BrandMark";
import Icon from "@/components/Icon";


export default function LoginPage() {
  const router = useRouter();
  const errorId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("%c🔒 [KATARUNGANHUB VERIFICATION]: NEW LOGIN PAGE LOADED (VERSION 2.0.0) - ROLE DROPDOWN IS REMOVED!", "color: #0038a8; font-size: 14px; font-weight: bold;");
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient({ rememberMe });
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex">
      <div className="hidden lg:block lg:w-[45%] relative overflow-hidden">
        <Image
          src="/images/barangay-hall.png"
          alt="Barangay hall"
          fill
          sizes="45vw"
          className="object-cover object-[center_65%]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050c1e] via-[#050c1e]/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <h2 className="font-display text-3xl font-semibold text-white leading-snug">
            Barangay Case Tracking
            <br />
            and Management System
          </h2>
          <p className="text-white/75 text-sm mt-3 max-w-sm">
            A digital record for the Katarungang Pambarangay process — from filing to settlement.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-24 opacity-[0.06] lg:hidden">
          <BrandMark size={420} />
        </div>

        <form
          onSubmit={handleSubmit}
          aria-describedby={error ? errorId : undefined}
          className="relative bg-white/90 border border-border rounded-sm shadow-[0_1px_2px_rgba(30,42,63,0.06),0_12px_32px_-16px_rgba(30,42,63,0.25)] p-8 w-full max-w-sm"
        >
          <div className="flex justify-center mb-4">
            <BrandMark size={128} />
          </div>
          <h1 className="font-display text-3xl font-semibold text-center text-foreground">Welcome Back!</h1>
          <p className="text-center text-base text-foreground-muted mt-1 mb-6">Sign in to your account</p>
          <div className="h-px bg-brass/40 mb-6" aria-hidden="true" />

          <label className="block text-sm font-medium tracking-wide uppercase text-foreground-muted mb-1" htmlFor="email">
            Email
          </label>
          <div className="relative mb-4">
            <Icon name="mail" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-12 text-base border border-border rounded-sm pl-10 pr-3 py-2 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            />
          </div>

          <label className="block text-sm font-medium tracking-wide uppercase text-foreground-muted mb-1" htmlFor="password">
            Password
          </label>
          <div className="relative mb-3">
            <Icon name="lock" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-12 text-base border border-border rounded-sm pl-10 pr-11 py-2 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
            >
              <Icon name={showPassword ? "eye-off" : "eye"} className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between mb-5 text-base">
            <label className="flex items-center gap-2 text-foreground-muted">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-primary font-medium hover:underline">
              Forgot Password?
            </Link>
          </div>

          {error && (
            <p id={errorId} role="alert" className="text-danger text-base mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-12 text-base bg-primary text-white rounded-sm py-2 font-medium tracking-wide disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary hover:bg-primary/90 transition-colors"
          >
            {loading ? "Signing in…" : "Login"}
          </button>

          <p className="text-center text-[0.65rem] text-foreground-muted mt-6">
            © {new Date().getFullYear()} KatarunganHub
          </p>
        </form>
      </div>
    </main>
  );
}
