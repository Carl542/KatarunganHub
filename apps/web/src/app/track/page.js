"use client";

import { useState } from "react";
import Image from "next/image";
import { apiFetch } from "@/lib/apiClient";
import BrandMark from "@/components/BrandMark";
import Icon from "@/components/Icon";

const STATUS_COLOR = {
  Closed: "text-accent",
  Active: "text-warning",
  "Under Mediation": "text-warning",
  New: "text-primary",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TrackCasePage() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [verify, setVerify] = useState("");
  const [result, setResult] = useState(null);
  const [lookedUpAt, setLookedUpAt] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setNotFound(false);
    setLoading(true);
    try {
      const data = await apiFetch("/complaints/track", {
        method: "POST",
        body: JSON.stringify({ referenceNumber, verify }),
      });
      setResult(data);
      setLookedUpAt(new Date());
    } catch {
      setResult(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  function newSearch() {
    setResult(null);
    setNotFound(false);
    setReferenceNumber("");
    setVerify("");
  }

  return (
    <main className="min-h-screen flex">
      <div className="hidden lg:block lg:w-[38%] relative overflow-hidden shrink-0">
        <Image src="/images/barangay-hall.png" alt="Barangay hall" fill sizes="38vw" className="object-cover object-[center_65%]" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050c1e] via-[#050c1e]/30 to-[#050c1e]/10" />
        <div className="absolute inset-x-0 bottom-0 p-10">
          <h2 className="font-display text-3xl font-semibold text-white leading-snug">Track Your Case</h2>
          <p className="text-white/80 text-sm mt-3 max-w-sm">
            Enter your reference number and last name or mobile number to check your case status.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-start lg:items-center justify-center px-4 py-10 relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-24 opacity-[0.05] hidden lg:block">
          <BrandMark size={420} />
        </div>

        <div className="relative w-full max-w-5xl">
          {!result ? (
            <div className="bg-white/90 border border-border rounded-sm shadow-[0_1px_2px_rgba(30,42,63,0.06),0_12px_32px_-16px_rgba(30,42,63,0.25)] p-8 w-full max-w-sm mx-auto">
              <div className="flex justify-center mb-3">
                <BrandMark size={72} />
              </div>
              <h1 className="font-display text-xl font-semibold text-center">Track Case Status</h1>
              <div className="h-px bg-brass/40 my-5" aria-hidden="true" />

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Reference Number</span>
                  <input
                    required
                    placeholder="e.g. REF-2026-000042"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="ref-number border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">
                    Last Name or Mobile Number
                  </span>
                  <input
                    required
                    placeholder="e.g. Dela Cruz or 09123456789"
                    value={verify}
                    onChange={(e) => setVerify(e.target.value)}
                    className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-white rounded-sm py-2 min-h-11 font-medium tracking-wide disabled:opacity-60 hover:bg-primary/90 transition-colors mt-1"
                >
                  {loading ? "Searching…" : "Track Case"}
                </button>
              </form>

              {notFound && (
                <p className="text-danger text-sm mt-4">
                  No matching case found. Please check your reference number and last name/mobile number.
                </p>
              )}

              <p className="text-center text-xs text-foreground-muted mt-5">
                Your information is secure and will not be shared.
              </p>
            </div>
          ) : (
            <div className="bg-white/90 border border-border rounded-sm shadow-[0_1px_2px_rgba(30,42,63,0.06),0_12px_32px_-16px_rgba(30,42,63,0.25)] p-8">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display text-lg font-semibold">Case Status Result</h2>
                <button
                  onClick={newSearch}
                  className="border border-border rounded-sm px-4 min-h-10 text-sm font-medium hover:bg-muted transition-colors"
                >
                  New Search
                </button>
              </div>

              <div className="flex items-center gap-3 mt-4 mb-1">
                <span className="ref-number text-xl font-semibold text-primary">{result.reference_number}</span>
                <span className={`stamp ${STATUS_COLOR[result.status] || "text-foreground-muted"}`}>{result.status}</span>
              </div>
              <p className="text-xs text-foreground-muted mb-6">As of {formatDateTime(lookedUpAt)}</p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xs font-medium tracking-wide uppercase text-foreground-muted mb-3">Case Information</h3>
                  <dl className="text-sm flex flex-col gap-3">
                    <div>
                      <dt className="text-foreground-muted text-xs">Complainant</dt>
                      <dd className="font-medium">{result.complainant_name || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-foreground-muted text-xs">Respondent</dt>
                      <dd className="font-medium">{result.respondent_name || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-foreground-muted text-xs">Case Type</dt>
                      <dd className="font-medium">{result.category || result.type}</dd>
                    </div>
                    <div>
                      <dt className="text-foreground-muted text-xs">Date Filed</dt>
                      <dd className="font-medium">{formatDate(result.filed_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-foreground-muted text-xs">Assigned To</dt>
                      <dd className="font-medium">{result.assigned_to}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-xs font-medium tracking-wide uppercase text-foreground-muted mb-3">Status Timeline</h3>
                  <ul className="flex flex-col">
                    {result.timeline.map((step, i) => {
                      const isLast = i === result.timeline.length - 1;
                      return (
                        <li key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span
                              className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center ${
                                isLast ? "bg-primary ring-4 ring-[#0038a8]/20" : "bg-accent"
                              }`}
                            >
                              {!isLast && <Icon name="check-circle" className="w-3 h-3 text-white" />}
                            </span>
                            {!isLast && <span className="w-px flex-1 bg-border my-0.5" />}
                          </div>
                          <div className="pb-4">
                            <p className={`text-sm font-medium ${isLast ? "text-primary" : ""}`}>{step.label}</p>
                            <p className="text-xs text-foreground-muted">{formatDateTime(step.date)}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xs font-medium tracking-wide uppercase text-foreground-muted mb-3">Next Schedule</h3>
                    {result.next_schedule ? (
                      <div className="text-sm flex flex-col gap-1.5">
                        <span className="flex items-center gap-2">
                          <Icon name="calendar" className="w-4 h-4 text-primary shrink-0" />
                          {formatDate(result.next_schedule.scheduled_at)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Icon name="clock" className="w-4 h-4 text-primary shrink-0" />
                          {new Date(result.next_schedule.scheduled_at).toLocaleTimeString("en-PH", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center gap-2">
                          <Icon name="building" className="w-4 h-4 text-primary shrink-0" />
                          {result.next_schedule.venue || "—"}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground-muted">No upcoming schedule.</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-medium tracking-wide uppercase text-foreground-muted mb-3">Latest Update</h3>
                    <p className="text-sm leading-relaxed">
                      {result.latest_update || "No updates recorded yet."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
