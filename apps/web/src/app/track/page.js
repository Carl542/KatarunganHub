"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import BrandMark from "@/components/BrandMark";

export default function TrackCasePage() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    apiFetch("/settings/public")
      .then(setSettings)
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setNotFound(false);
    setResult(null);
    setLoading(true);
    try {
      const data = await apiFetch(`/complaints/track/${encodeURIComponent(referenceNumber)}`);
      setResult(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white/90 border border-border rounded-sm shadow-[0_1px_2px_rgba(30,42,63,0.06),0_12px_32px_-16px_rgba(30,42,63,0.25)] p-8 w-full max-w-sm">
        <div className="flex justify-center mb-3">
          <BrandMark size={64} />
        </div>
        <h1 className="font-display text-xl font-semibold text-center">Track Your Case</h1>
        <p className="text-center text-xs tracking-[0.14em] uppercase text-foreground-muted mt-1 mb-6">
          {settings?.barangay_name ? `${settings.barangay_name} — Katarungang Pambarangay` : "Katarungang Pambarangay Registry"}
        </p>
        <div className="h-px bg-brass/40 mb-6" aria-hidden="true" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Reference Number</span>
            <input
              required
              placeholder="REF-2026-000042"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="ref-number border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white rounded-sm py-2 min-h-11 font-medium tracking-wide disabled:opacity-60 hover:bg-primary/90 transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {loading ? "Searching…" : "Track Case"}
          </button>
        </form>

        {notFound && (
          <p className="text-danger text-sm mt-4">
            No case record found. Please check your reference number.
          </p>
        )}

        {result && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="ref-number font-medium">{result.reference_number}</p>
            <p className="text-sm text-foreground-muted mt-2">
              <span className="stamp text-primary">{result.status}</span>
            </p>
            <p className="text-sm text-foreground-muted mt-2">Type: {result.type}</p>
            <p className="text-sm text-foreground-muted">{result.title}</p>
          </div>
        )}

        {(settings?.barangay_address || settings?.barangay_contact) && (
          <div className="mt-6 pt-4 border-t border-border text-center text-xs text-foreground-muted">
            {settings.barangay_address && <p>{settings.barangay_address}</p>}
            {settings.barangay_contact && <p>{settings.barangay_contact}</p>}
          </div>
        )}
      </div>
    </main>
  );
}
