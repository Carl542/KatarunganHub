"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import BrandMark from "@/components/BrandMark";

export default function LoginPage() {
  const router = useRouter();
  const errorId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
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
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-24 opacity-[0.06]"
      >
        <BrandMark size={420} />
      </div>

      <form
        onSubmit={handleSubmit}
        aria-describedby={error ? errorId : undefined}
        className="relative bg-white/90 border border-border rounded-sm shadow-[0_1px_2px_rgba(30,42,63,0.06),0_12px_32px_-16px_rgba(30,42,63,0.25)] p-8 w-full max-w-sm"
      >
        <div className="flex justify-center mb-3">
          <BrandMark size={64} />
        </div>
        <h1 className="font-display text-2xl font-semibold text-center text-foreground">KatarunganHub</h1>
        <p className="text-center text-xs tracking-[0.14em] uppercase text-foreground-muted mt-1 mb-6">
          Barangay Case Tracking &amp; Management
        </p>
        <div className="h-px bg-brass/40 mb-6" aria-hidden="true" />

        <label className="block text-xs font-medium tracking-wide uppercase text-foreground-muted mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full min-h-11 border border-border rounded-sm px-3 py-2 mb-4 bg-white focus-visible:outline-3 focus-visible:outline-primary"
        />

        <label className="block text-xs font-medium tracking-wide uppercase text-foreground-muted mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full min-h-11 border border-border rounded-sm px-3 py-2 mb-5 bg-white focus-visible:outline-3 focus-visible:outline-primary"
        />

        {error && (
          <p id={errorId} role="alert" className="text-danger text-sm mb-4">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-11 bg-primary text-white rounded-sm py-2 font-medium tracking-wide disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary hover:bg-primary/90 transition-colors"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
