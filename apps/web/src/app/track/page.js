"use client";

import { useEffect, useState } from "react";
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
  const [searchMode, setSearchMode] = useState("reference");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [verify, setVerify] = useState("");
  const [result, setResult] = useState(null);
  const [lookedUpAt, setLookedUpAt] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [barangay, setBarangay] = useState(null);

  useEffect(() => {
    apiFetch("/settings/public")
      .then(setBarangay)
      .catch(() => {});
  }, []);

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

  function switchMode(mode) {
    setSearchMode(mode);
    setVerify("");
    setNotFound(false);
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header role="banner" className="h-14 bg-white/90 border-b border-brass/30 flex items-center px-6 shrink-0">
        <span className="text-xs tracking-[0.14em] uppercase text-foreground-muted">
          <span className="text-primary font-medium">Home</span> / Track Your Case
        </span>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="lg:w-[380px] shrink-0 relative overflow-hidden flex flex-col bg-sidebar text-white">
          <div className="flex items-center gap-3 px-6 pt-6 pb-4 relative z-10">
            <BrandMark size={44} />
            <div className="leading-tight">
              <span className="font-display text-base font-semibold block">KatarunganHub</span>
              {barangay?.barangay_name && <span className="text-xs text-white/60 block mt-0.5">{barangay.barangay_name}</span>}
            </div>
          </div>

          <div className="relative flex-1 min-h-[220px]">
            <Image
              src="/images/barangay-hall.png"
              alt="Barangay hall"
              fill
              sizes="380px"
              className="object-cover object-[center_65%]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/60 to-sidebar/10" />
          </div>

          <div className="relative z-10 px-6 pb-8 -mt-4">
            <h1 className="font-display text-2xl font-semibold leading-snug mb-2">Track Your Case</h1>
            <p className="text-white/75 text-sm mb-5">
              Enter your reference number and last name or mobile number to check your case status.
            </p>

            <div className="flex mb-4 border-b border-white/20">
              <button
                type="button"
                onClick={() => switchMode("reference")}
                className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                  searchMode === "reference" ? "border-white text-white" : "border-transparent text-white/60 hover:text-white/85"
                }`}
              >
                By Reference Number
              </button>
              <button
                type="button"
                onClick={() => switchMode("mobile")}
                className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                  searchMode === "mobile" ? "border-white text-white" : "border-transparent text-white/60 hover:text-white/85"
                }`}
              >
                By Mobile Number
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-white/70">Reference Number</span>
                <div className="relative">
                  <Icon name="search" className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Enter reference number"
                    className="ref-number w-full border border-border rounded-sm pl-9 pr-3 py-2 min-h-11 bg-white text-foreground focus-visible:outline-3 focus-visible:outline-primary"
                  />
                </div>
                <span className="text-[0.7rem] text-white/50">e.g. REF-2026-000007</span>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-white/70">
                  {searchMode === "reference" ? "Last Name" : "Mobile Number"}
                </span>
                <div className="relative">
                  <Icon name="user" className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type={searchMode === "mobile" ? "tel" : "text"}
                    value={verify}
                    onChange={(e) => setVerify(e.target.value)}
                    placeholder={searchMode === "reference" ? "Enter last name" : "Enter mobile number"}
                    className="w-full border border-border rounded-sm pl-9 pr-3 py-2 min-h-11 bg-white text-foreground focus-visible:outline-3 focus-visible:outline-primary"
                  />
                </div>
                <span className="text-[0.7rem] text-white/50">{searchMode === "reference" ? "e.g. Dela Cruz" : "e.g. 09171234567"}</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white rounded-sm py-2 min-h-11 font-medium tracking-wide disabled:opacity-60 hover:bg-primary/90 transition-colors mt-2 flex items-center justify-center gap-2"
              >
                <Icon name="search" className="w-4 h-4" />
                {loading ? "Searching…" : "Search Case"}
              </button>

              {notFound && (
                <p className="text-danger-light text-sm" style={{ color: "#ff9b9b" }}>
                  No matching case found. Please check your details.
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-10">
          {!result ? (
            <div className="h-full flex items-center justify-center text-foreground-muted text-sm">
              Enter your case details on the left to view its status.
            </div>
          ) : (
            <div className="bg-white/90 border border-border rounded-sm shadow-[0_1px_2px_rgba(30,42,63,0.06),0_12px_32px_-16px_rgba(30,42,63,0.25)] p-8 max-w-4xl">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display text-lg font-semibold">Case Status Result</h2>
                <button
                  onClick={newSearch}
                  className="border border-border rounded-sm px-4 min-h-10 text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
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
