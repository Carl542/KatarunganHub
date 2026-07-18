"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import BrandMark from "@/components/BrandMark";
import Icon from "@/components/Icon";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-24 opacity-[0.06]">
        <BrandMark size={420} />
      </div>

      <div className="relative bg-white/90 border border-border rounded-sm shadow-[0_1px_2px_rgba(30,42,63,0.06),0_12px_32px_-16px_rgba(30,42,63,0.25)] p-8 w-full max-w-sm">
        <div className="flex justify-center mb-3">
          <BrandMark size={64} />
        </div>
        <h1 className="font-display text-2xl font-semibold text-center text-foreground">Forgot Password</h1>
        <p className="text-center text-sm text-foreground-muted mt-1 mb-6">
          Enter your account email and we&rsquo;ll send you a reset link.
        </p>
        <div className="h-px bg-brass/40 mb-6" aria-hidden="true" />

        {sent ? (
          <p className="flex items-start gap-2 text-sm text-accent bg-accent/10 border border-accent rounded-sm px-3 py-3">
            <Icon name="check-circle" className="w-4 h-4 shrink-0 mt-0.5" />
            Check your email for a link to reset your password.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="block text-xs font-medium tracking-wide uppercase text-foreground-muted mb-1" htmlFor="email">
              Email
            </label>
            <div className="relative mb-5">
              <Icon name="mail" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-h-11 border border-border rounded-sm pl-9 pr-3 py-2 bg-white focus-visible:outline-3 focus-visible:outline-primary"
              />
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
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-6">
          <Link href="/login" className="text-primary font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
