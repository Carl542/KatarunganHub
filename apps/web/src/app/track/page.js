"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import BrandMark from "@/components/BrandMark";
import Icon from "@/components/Icon";

const STATUS_COLOR = {
  Closed: "text-accent bg-accent/10 border-accent/30",
  Active: "text-amber-700 bg-amber-50 border-amber-200",
  "Under Mediation": "text-amber-700 bg-amber-50 border-amber-200",
  "Settlement monitoring": "text-emerald-700 bg-emerald-50 border-emerald-200",
  New: "text-primary bg-primary/10 border-primary/30",
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
    <main className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Header Bar */}
      <header role="banner" className="h-14 bg-white/90 border-b border-border/80 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BrandMark size={28} />
            <span className="font-display font-bold text-sm tracking-tight text-foreground hidden xs:inline-block">
              KatarunganHub
            </span>
          </Link>
          <span className="text-xs text-foreground-muted mx-1">/</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Track Case</span>
        </div>

        <Link
          href="/login"
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-primary/20 hover:border-primary/40 bg-primary/5"
        >
          <Icon name="user" className="w-3.5 h-3.5" />
          <span>Staff Login</span>
        </Link>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side Hero Cover (Visible on Tablet/Desktop) */}
        <div className="lg:w-[40%] shrink-0 relative overflow-hidden min-h-[220px] sm:min-h-[280px] hidden md:block">
          <Image
            src="/images/barangay-hall.png"
            alt="Barangay hall"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-[center_65%]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050c1e] via-[#050c1e]/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white leading-snug mb-2">
              Public Case Tracker
            </h1>
            <p className="text-white/80 text-xs sm:text-sm max-w-sm leading-relaxed">
              Check the real-time status, upcoming schedules, and proceedings of your barangay case anytime.
            </p>
          </div>
        </div>

        {/* Right Side Form / Result Section */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 flex items-center justify-center">
          {!result ? (
            <div className="bg-white border border-border/80 rounded-xl shadow-sm p-5 sm:p-8 w-full max-w-md my-auto">
              <div className="flex justify-center mb-3">
                <BrandMark size={56} />
              </div>
              <h2 className="font-display text-xl font-bold text-center text-foreground">
                Track Case Status
              </h2>
              <p className="text-xs text-foreground-muted text-center mt-1 mb-5">
                Enter your reference number & verification details below
              </p>

              <div className="h-px bg-border/60 my-4" aria-hidden="true" />

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold tracking-wider uppercase text-foreground-muted">
                    Reference Number *
                  </span>
                  <input
                    required
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. REF-2026-000013"
                    className="ref-number border border-border rounded-md px-3.5 py-2.5 text-base sm:text-sm bg-white focus-visible:outline-2 focus-visible:outline-primary w-full"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold tracking-wider uppercase text-foreground-muted">
                    Last Name or Mobile Number *
                  </span>
                  <input
                    required
                    value={verify}
                    onChange={(e) => setVerify(e.target.value)}
                    placeholder="e.g. Gemilga or 09171234567"
                    className="border border-border rounded-md px-3.5 py-2.5 text-base sm:text-sm bg-white focus-visible:outline-2 focus-visible:outline-primary w-full"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-white rounded-md py-3 font-semibold text-sm tracking-wide disabled:opacity-60 hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2 mt-2 w-full active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Icon name="refresh-cw" className="w-4 h-4 animate-spin" />
                      <span>Searching Case…</span>
                    </>
                  ) : (
                    <>
                      <Icon name="search" className="w-4 h-4" />
                      <span>Track Case Status</span>
                    </>
                  )}
                </button>

                {notFound && (
                  <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                    <Icon name="alert-circle" className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>No matching case found. Please check your Reference Number or Last Name.</span>
                  </div>
                )}
              </form>

              <p className="text-center text-xs text-foreground-muted mt-6 flex items-center justify-center gap-1.5 pt-4 border-t border-border/40">
                <Icon name="lock" className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>Encrypted &amp; secure public lookup</span>
              </p>
            </div>
          ) : (
            <div className="bg-white border border-border/80 rounded-xl shadow-sm p-4 sm:p-8 w-full max-w-4xl">
              {/* Header Bar */}
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4 pb-4 border-b border-border/60">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">Case Status Result</h2>
                  <p className="text-xs text-foreground-muted">As of {formatDateTime(lookedUpAt)}</p>
                </div>
                <button
                  onClick={newSearch}
                  className="bg-primary text-white rounded-md px-4 py-2 text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2"
                >
                  <Icon name="search" className="w-3.5 h-3.5" />
                  New Search
                </button>
              </div>

              {/* Ref Number & Status Chip */}
              <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-50 p-4 rounded-lg border border-border/60 mb-6">
                <div>
                  <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider block">
                    Case Reference
                  </span>
                  <span className="ref-number text-xl sm:text-2xl font-bold text-primary">
                    {result.reference_number}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold border ${
                    STATUS_COLOR[result.status] || "text-foreground-muted bg-gray-100 border-gray-200"
                  }`}
                >
                  {result.status}
                </span>
              </div>

              {/* 3-Column Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Column 1: Case Information */}
                <div className="bg-white rounded-lg border border-border/60 p-4">
                  <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-foreground-muted mb-3 pb-2 border-b border-border/40">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Icon name="file-text" className="w-3.5 h-3.5" />
                    </span>
                    Case Details
                  </h3>
                  <dl className="text-xs flex flex-col gap-3">
                    <div className="flex gap-2.5">
                      <Icon name="user" className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <dt className="text-foreground-muted font-medium">Complainant</dt>
                        <dd className="font-bold text-foreground text-sm">{result.complainant_name || "—"}</dd>
                      </div>
                    </div>
                    <div className="flex gap-2.5">
                      <Icon name="user" className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <dt className="text-foreground-muted font-medium">Respondent</dt>
                        <dd className="font-bold text-foreground text-sm">{result.respondent_name || "—"}</dd>
                      </div>
                    </div>
                    <div className="flex gap-2.5">
                      <Icon name="file-text" className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <dt className="text-foreground-muted font-medium">Nature of Dispute</dt>
                        <dd className="font-semibold text-foreground">{result.category || result.type}</dd>
                      </div>
                    </div>
                    <div className="flex gap-2.5">
                      <Icon name="calendar" className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <dt className="text-foreground-muted font-medium">Date Encoded</dt>
                        <dd className="font-semibold text-foreground">{formatDate(result.filed_at)}</dd>
                      </div>
                    </div>
                    <div className="flex gap-2.5">
                      <Icon name="shield" className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <dt className="text-foreground-muted font-medium">Assigned Officer</dt>
                        <dd className="font-semibold text-foreground">{result.assigned_to || "Punong Barangay / Secretary"}</dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {/* Column 2: Status Timeline */}
                <div className="bg-white rounded-lg border border-border/60 p-4">
                  <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-foreground-muted mb-3 pb-2 border-b border-border/40">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Icon name="clock" className="w-3.5 h-3.5" />
                    </span>
                    Progress Timeline
                  </h3>
                  <ul className="flex flex-col gap-1">
                    {(result.timeline || []).map((step, i) => {
                      const isLast = i === (result.timeline.length - 1);
                      return (
                        <li key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span
                              className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                                isLast ? "bg-primary text-white ring-4 ring-blue-50" : "bg-emerald-600 text-white"
                              }`}
                            >
                              <Icon name={iconForStage(step.label)} className="w-3.5 h-3.5" />
                            </span>
                            {!isLast && <span className="w-px flex-1 bg-border my-1" />}
                          </div>
                          <div className="pb-3">
                            <p className={`text-xs font-bold ${isLast ? "text-primary" : "text-foreground"}`}>
                              {step.label}
                            </p>
                            <p className="text-[11px] text-foreground-muted">{formatDateTime(step.date)}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Column 3: Next Schedule & Latest Notice */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-lg border border-border/60 p-4">
                    <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-foreground-muted mb-3 pb-2 border-b border-border/40">
                      <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Icon name="calendar" className="w-3.5 h-3.5" />
                      </span>
                      Next Scheduled Hearing
                    </h3>
                    {result.next_schedule ? (
                      <div className="bg-blue-50/70 border border-blue-100 rounded-md p-3 text-xs flex flex-col gap-2">
                        <span className="flex items-center gap-2 text-slate-800 font-semibold">
                          <Icon name="calendar" className="w-4 h-4 text-blue-600 shrink-0" />
                          {formatDate(result.next_schedule.scheduled_at)}
                        </span>
                        <span className="flex items-center gap-2 text-slate-700">
                          <Icon name="clock" className="w-4 h-4 text-blue-600 shrink-0" />
                          {new Date(result.next_schedule.scheduled_at).toLocaleTimeString("en-PH", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center gap-2 text-slate-700">
                          <Icon name="map-pin" className="w-4 h-4 text-blue-600 shrink-0" />
                          {result.next_schedule.venue || "Barangay Hall — Session Room"}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-border/60 rounded-md p-3 text-xs flex items-center gap-2 text-foreground-muted">
                        <Icon name="info" className="w-4 h-4 shrink-0 text-slate-400" />
                        <span>No upcoming hearing scheduled at this moment.</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-lg border border-border/60 p-4">
                    <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-foreground-muted mb-3 pb-2 border-b border-border/40">
                      <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Icon name="mail" className="w-3.5 h-3.5" />
                      </span>
                      Latest Official Notice
                    </h3>
                    <div className="bg-slate-50 border border-border/60 rounded-md p-3 text-xs text-foreground-muted leading-relaxed">
                      {result.latest_update || "No additional notices recorded yet."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Notice Banner */}
              <div className="mt-6 bg-amber-50/80 border border-amber-200/80 rounded-lg p-4 flex items-start gap-3">
                <Icon name="bell" className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-900 mb-0.5">Important Notice for Parties</p>
                  <p className="text-amber-800/90 leading-relaxed">
                    Please bring one valid Government ID and arrive 15 minutes before your scheduled session. For urgent inquiries, visit your Barangay Hall.
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
