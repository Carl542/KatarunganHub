"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import BrandMark from "@/components/BrandMark";
import Icon from "@/components/Icon";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-24 opacity-[0.06]">
        <BrandMark size={420} />
      </div>

      <div className="relative bg-white/90 border border-border rounded-sm shadow-[0_1px_2px_rgba(30,42,63,0.06),0_12px_32px_-16px_rgba(30,42,63,0.25)] p-8 w-full max-w-sm">
        <div className="flex justify-center mb-3">
          <BrandMark size={72} />
        </div>
        <h1 className="font-display text-2xl font-semibold text-center text-foreground">Set New Password</h1>
        <p className="text-center text-sm text-foreground-muted mt-1 mb-6">
          Choose a new password for your account.
        </p>
        <div className="h-px bg-brass/40 mb-6" aria-hidden="true" />

        {done ? (
          <p className="flex items-start gap-2 text-sm text-accent bg-accent/10 border border-accent rounded-sm px-3 py-3">
            <Icon name="check-circle" className="w-4 h-4 shrink-0 mt-0.5" />
            Password updated. Redirecting…
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="block text-xs font-medium tracking-wide uppercase text-foreground-muted mb-1" htmlFor="password">
              New password
            </label>
            <div className="relative mb-4">
              <Icon name="lock" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-11 border border-border rounded-sm pl-9 pr-10 py-2 bg-white focus-visible:outline-3 focus-visible:outline-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
              >
                <Icon name={showPassword ? "eye-off" : "eye"} className="w-4 h-4" />
              </button>
            </div>

            <label className="block text-xs font-medium tracking-wide uppercase text-foreground-muted mb-1" htmlFor="confirmPassword">
              Confirm password
            </label>
            <div className="relative mb-5">
              <Icon name="lock" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full min-h-11 border border-border rounded-sm pl-9 pr-10 py-2 bg-white focus-visible:outline-3 focus-visible:outline-primary"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
              >
                <Icon name={showConfirmPassword ? "eye-off" : "eye"} className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <p role="alert" className="text-danger text-sm mb-4">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-11 bg-primary text-white rounded-sm py-2 font-medium tracking-wide disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary hover:bg-primary/90 transition-colors"
            >
              {loading ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
