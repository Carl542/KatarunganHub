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
    <main className="min-h-screen flex items-center justify-center bg-primary-light px-4">
      <form
        onSubmit={handleSubmit}
        aria-describedby={error ? errorId : undefined}
        className="bg-white rounded-xl shadow-md p-8 w-full max-w-sm"
      >
        <div className="flex justify-center mb-4">
          <BrandMark size={64} />
        </div>
        <h1 className="text-xl font-bold text-center text-foreground mb-6">KatarunganHub</h1>

        <label className="block text-sm font-medium mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full min-h-11 border border-border rounded-md px-3 py-2 mb-4 focus-visible:outline-3 focus-visible:outline-primary"
        />

        <label className="block text-sm font-medium mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full min-h-11 border border-border rounded-md px-3 py-2 mb-4 focus-visible:outline-3 focus-visible:outline-primary"
        />

        {error && (
          <p id={errorId} role="alert" className="text-danger text-sm mb-4">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-11 bg-primary text-white rounded-md py-2 font-medium disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
