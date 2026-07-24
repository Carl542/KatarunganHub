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

function iconForStage(label) {
  const l = (label || "").toLowerCase();
  if (l.includes("encoded")) return "check-circle";
  if (l.includes("jurisdiction")) return "shield";
  if (l.includes("summons")) return "file-text";
  if (l.includes("pangkat") || l.includes("mediation") || l.includes("conciliation")) return "users";
  if (l.includes("closed") || l.includes("disposition")) return "check-circle";
  return "clipboard-list";
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
    <main className="min-h-screen flex flex-col">
      <header role="banner" className="h-14 bg-white/90 border-b border-brass/30 flex items-center px-6 shrink-0">
        <span className="text-xs tracking-[0.14em] uppercase text-foreground-muted">
          <span className="text-primary font-medium">Home</span> / Track Your Case
        </span>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="lg:w-[42%] shrink-0 relative overflow-hidden min-h-[280px] hidden sm:block">
          <Image
            src="/images/barangay-hall.png"
            alt="Barangay hall"
            fill
            sizes="42vw"
            className="object-cover object-[center_65%]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050c1e] via-[#050c1e]/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10">
            <h1 className="font-display text-3xl font-semibold text-white leading-snug mb-2">Track Your Case</h1>
            <p className="text-white/80 text-sm max-w-sm">
              Enter your reference number and last name or mobile number to check your case status.
            </p>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-10 flex items-center justify-center">
          {!result ? (
            <div className="bg-white/90 border border-border rounded-sm shadow-[0_1px_2px_rgba(30,42,63,0.06),0_12px_32px_-16px_rgba(30,42,63,0.25)] p-8 w-full max-w-sm">
              <div className="flex justify-center mb-3">
                <BrandMark size={64} />
              </div>
              <h2 className="font-display text-xl font-semibold text-center">Track Case Status</h2>
              <div className="h-px bg-brass/40 my-5" aria-hidden="true" />

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Reference Number *</span>
                  <input
                    required
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. REF-2026-000007"
                    className="ref-number border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">
                    Last Name or Mobile Number *
                  </span>
                  <input
                    required
                    value={verify}
                    onChange={(e) => setVerify(e.target.value)}
                    placeholder="e.g. Dela Cruz or 09171234567"
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

                {notFound && (
                  <p className="text-danger text-sm">No matching case found. Please check your details.</p>
                )}
              </form>

              <p className="text-center text-xs text-foreground-muted mt-5 flex items-center justify-center gap-1.5">
                <Icon name="lock" className="w-3.5 h-3.5 shrink-0" />
                Your information is secure and will not be shared.
              </p>
            </div>
          ) : (
            <div className="bg-white/90 border border-border rounded-sm shadow-[0_1px_2px_rgba(30,42,63,0.06),0_12px_32px_-16px_rgba(30,42,63,0.25)] p-8 max-w-4xl">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display text-lg font-semibold">Case Status Result</h2>
                <button
                  onClick={newSearch}
                  className="bg-primary text-white rounded-sm px-4 min-h-10 text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Icon name="search" className="w-4 h-4" />
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
                  <h3 className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-foreground-muted mb-3">
                    <span className="w-6 h-6 rounded-full bg-[#e3eaf7] text-[#0038a8] flex items-center justify-center shrink-0">
                      <Icon name="file-text" className="w-3.5 h-3.5" />
                    </span>
                    Case Information
                  </h3>
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
                  <h3 className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-foreground-muted mb-3">
                    <span className="w-6 h-6 rounded-full bg-[#f3e9d2] text-[#9c6b1f] flex items-center justify-center shrink-0">
                      <Icon name="clock" className="w-3.5 h-3.5" />
                    </span>
                    Status Timeline
                  </h3>
                  <ul className="flex flex-col">
                    {result.timeline.map((step, i) => {
                      const isLast = i === result.timeline.length - 1;
                      return (
                        <li key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span
                              className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center ${
                                isLast ? "bg-primary text-white ring-4 ring-[#0038a8]/20" : "bg-accent text-white"
                              }`}
                            >
                              <Icon name={iconForStage(step.label)} className="w-3.5 h-3.5" />
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
                    <h3 className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-foreground-muted mb-3">
                      <span className="w-6 h-6 rounded-full bg-[#e3eaf7] text-[#0038a8] flex items-center justify-center shrink-0">
                        <Icon name="calendar" className="w-3.5 h-3.5" />
                      </span>
                      Next Schedule
                    </h3>
                    {result.next_schedule ? (
                      <div className="bg-[#e3eaf7] rounded-sm p-3 text-sm flex flex-col gap-1.5">
                        <span className="flex items-center gap-2">
                          <Icon name="calendar" className="w-4 h-4 text-[#0038a8] shrink-0" />
                          {formatDate(result.next_schedule.scheduled_at)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Icon name="clock" className="w-4 h-4 text-[#0038a8] shrink-0" />
                          {new Date(result.next_schedule.scheduled_at).toLocaleTimeString("en-PH", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center gap-2">
                          <Icon name="building" className="w-4 h-4 text-[#0038a8] shrink-0" />
                          {result.next_schedule.venue || "—"}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-[#e3eaf7] rounded-sm p-3 text-sm flex items-center gap-2 text-[#0038a8]">
                        <Icon name="info" className="w-4 h-4 shrink-0" />
                        No upcoming schedule.
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-foreground-muted mb-3">
                      <span className="w-6 h-6 rounded-full bg-[#e3eaf7] text-[#0038a8] flex items-center justify-center shrink-0">
                        <Icon name="mail" className="w-3.5 h-3.5" />
                      </span>
                      Latest Update
                    </h3>
                    <div className="bg-[#e3eaf7] rounded-sm p-3 text-sm leading-relaxed">
                      {result.latest_update || "No updates recorded yet."}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-[#f3e9d2] border border-brass/40 rounded-sm px-4 py-3 flex items-start gap-3">
                <Icon name="bell" className="w-5 h-5 text-[#9c6b1f] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#9c6b1f]">Reminder</p>
                  <p className="text-sm text-[#9c6b1f]/90">
                    Please monitor your case status for updates and attend all scheduled proceedings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
