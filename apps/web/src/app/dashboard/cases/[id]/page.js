"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import Icon from "@/components/Icon";
import SchedulesTab from "./tabs/SchedulesTab";
import PangkatTab from "./tabs/PangkatTab";
import AttendanceTab from "./tabs/AttendanceTab";
import DocumentsTab from "./tabs/DocumentsTab";
import WorkflowTab from "./tabs/WorkflowTab";
import { useCurrentProfile } from "@/lib/useCurrentProfile";

const TABS = ["Overview", "Workflow", "Schedules", "Pangkat", "Attendance", "Documents"];
const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

export default function CaseDetailsPage({ params }) {
  const { id } = use(params);
  const profile = useCurrentProfile();
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Overview");

  function load() {
    setLoading(true);
    apiFetch(`/complaints/${id}`)
      .then((data) => {
        setCaseData(data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
        <Icon name="refresh-cw" className="w-6 h-6 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Loading case details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-md p-6 max-w-xl my-4 text-rose-700 font-medium text-sm">
        {error}
      </div>
    );
  }

  if (!caseData) return null;

  const hasWorkflow = caseData.type === "Lupon" || caseData.type === "Non-Lupon";
  const isCaseParty = ["complainant", "respondent"].includes(profile?.role);
  const backHref = isCaseParty ? "/dashboard/my-cases" : "/dashboard/cases";
  const backLabel = isCaseParty ? "Back to My Cases" : "Back to Cases";

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 text-slate-800">
      {/* Top Title & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            {caseData.title}
          </h1>
          <div className="text-sm text-slate-500 mt-1 flex items-center gap-2 flex-wrap font-medium">
            <span className="font-mono text-slate-800 font-bold">{caseData.reference_number}</span>
            <span aria-hidden="true">·</span>
            <span>{caseData.type}</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
              {caseData.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {STAFF_ROLES.includes(profile?.role) && (
            <Link
              href={`/dashboard/cases/${id}/print`}
              target="_blank"
              className="border border-slate-300 rounded-md px-3.5 py-2 flex items-center gap-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Icon name="file-text" className="w-4 h-4 text-slate-600" />
              Print
            </Link>
          )}
          <Link
            href={backHref}
            className="bg-blue-600 text-white rounded-md px-4 py-2 flex items-center gap-2 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Icon name="chevron-right" className="w-4 h-4 rotate-180" />
            {backLabel}
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              tab === t
                ? "border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-md"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {tab === "Overview" && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 max-w-3xl flex flex-col gap-5 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1.5">Narrative</h2>
            <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-normal bg-slate-50/60 border border-slate-200 rounded-md p-4">
              {caseData.narrative || "No narrative encoded."}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1.5">Relief Requested</h2>
            <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-normal bg-slate-50/60 border border-slate-200 rounded-md p-4">
              {caseData.relief || "No specific relief recorded."}
            </p>
          </div>
        </div>
      )}

      {tab === "Workflow" && hasWorkflow && <WorkflowTab caseId={id} caseData={caseData} onUpdated={load} />}
      {tab === "Schedules" && <SchedulesTab caseId={id} />}
      {tab === "Pangkat" && <PangkatTab caseId={id} />}
      {tab === "Attendance" && <AttendanceTab caseId={id} />}
      {tab === "Documents" && <DocumentsTab caseId={id} />}
    </div>
  );
}
