"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import BrandMark from "@/components/BrandMark";

export default function TrackCasePage() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

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
    <main className="min-h-screen flex items-center justify-center bg-primary-light px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <BrandMark size={64} />
        </div>
        <h1 className="text-xl font-bold text-center mb-6">Track Your Case</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Reference Number</span>
            <input
              required
              placeholder="REF-2026-000042"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white rounded-md py-2 font-medium disabled:opacity-60"
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
          <div className="mt-4 border-t pt-4">
            <p className="font-bold">{result.reference_number}</p>
            <p className="text-sm text-gray-600">Status: {result.status}</p>
            <p className="text-sm text-gray-600">Type: {result.type}</p>
            <p className="text-sm text-gray-600">{result.title}</p>
          </div>
        )}
      </div>
    </main>
  );
}
