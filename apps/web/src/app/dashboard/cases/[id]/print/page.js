"use client";

import { useEffect, useState, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import { DOCUMENT_TYPES } from "@/lib/documentTypes";
import { useCurrentProfile } from "@/lib/useCurrentProfile";

const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

function formatDate(value) {
  if (!value) return "___________________";
  return new Date(value).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
}

function formatDateTime(value) {
  if (!value) return null;
  return new Date(value).toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SignatureLine({ label }) {
  return (
    <div className="mt-10">
      <div className="border-t border-foreground w-64" />
      <p className="text-sm mt-1">{label}</p>
    </div>
  );
}

function DocumentBody({ type, caseData, upcomingSchedule, schedules, attendance }) {
  const complainantName = caseData.complainant?.full_name || "the complainant";
  const respondentName = caseData.respondent?.full_name || "the respondent";

  if (type === "Summons" || type === "Notice of hearing") {
    return (
      <>
        <h2 className="text-center font-display text-xl font-semibold uppercase mb-8">
          {type === "Summons" ? "Summons" : "Notice of Hearing"}
        </h2>
        <p className="mb-4">TO: {respondentName} and {complainantName}</p>
        <p className="mb-4 leading-relaxed">
          You are hereby notified that a complaint captioned <strong>&ldquo;{caseData.title}&rdquo;</strong> (Reference
          No. {caseData.reference_number}) has been filed before this Barangay. You are directed to appear
          personally, together with any witnesses, for mediation/hearing on:
        </p>
        <p className="mb-4 pl-6">
          <strong>Date &amp; time:</strong>{" "}
          {upcomingSchedule ? formatDateTime(upcomingSchedule.scheduled_at) : "___________________"}
          <br />
          <strong>Venue:</strong> {upcomingSchedule?.venue || "___________________"}
        </p>
        <p className="mb-4 leading-relaxed">
          Failure to appear without valid reason may result in the dismissal of the complaint or the issuance of a
          Certification to File Action, as provided under the Revised Katarungang Pambarangay Law (RA 7160, Sec.
          399-422).
        </p>
        <SignatureLine label="Punong Barangay" />
      </>
    );
  }

  if (type === "Certification to File Action") {
    return (
      <>
        <h2 className="text-center font-display text-xl font-semibold uppercase mb-8">Certification to File Action</h2>
        <p className="mb-4 leading-relaxed">
          This is to certify that the dispute between <strong>{complainantName}</strong> (complainant) and{" "}
          <strong>{respondentName}</strong> (respondent), captioned <strong>&ldquo;{caseData.title}&rdquo;</strong>{" "}
          (Reference No. {caseData.reference_number}), was brought before the Lupong Tagapamayapa/Pangkat ng
          Tagapagkasundo of this Barangay for conciliation in accordance with the Revised Katarungang Pambarangay
          Law (RA 7160, Sec. 399-422), and that:
        </p>
        <div className="border border-foreground/30 rounded-sm px-4 py-3 mb-4">
          <label className="flex items-start gap-2 mb-2">
            <input type="checkbox" className="mt-1" readOnly />
            <span>No settlement was reached between the parties; or</span>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" readOnly />
            <span>The respondent failed to appear despite due notice, without valid reason.</span>
          </label>
        </div>
        <p className="mb-4 leading-relaxed">
          Accordingly, the complainant is hereby authorized to file the appropriate action in court or before the
          proper government office.
        </p>
        <SignatureLine label="Punong Barangay / Lupon Secretary" />
      </>
    );
  }

  if (type === "Amicable settlement") {
    return (
      <>
        <h2 className="text-center font-display text-xl font-semibold uppercase mb-8">Amicable Settlement</h2>
        <p className="mb-4 leading-relaxed">
          We, <strong>{complainantName}</strong> (complainant) and <strong>{respondentName}</strong> (respondent) in
          the case captioned <strong>&ldquo;{caseData.title}&rdquo;</strong> (Reference No.{" "}
          {caseData.reference_number}), having voluntarily agreed to settle our dispute amicably before the
          Lupong Tagapamayapa of this Barangay, hereby agree to the following terms:
        </p>
        <div className="border border-foreground/30 rounded-sm px-4 py-16 mb-6" />
        <p className="mb-4 leading-relaxed text-sm">
          This settlement is final and binding between the parties, subject to repudiation within ten (10) days
          from the date below on grounds of fraud, violence, or intimidation, as provided under RA 7160, Sec. 416.
        </p>
        <div className="grid grid-cols-2 gap-8">
          <SignatureLine label="Complainant" />
          <SignatureLine label="Respondent" />
          <SignatureLine label="Witness" />
          <SignatureLine label="Punong Barangay / Lupon Chairperson" />
        </div>
      </>
    );
  }

  if (type === "Mediation minutes") {
    const sessions = [...attendance].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return (
      <>
        <h2 className="text-center font-display text-xl font-semibold uppercase mb-2">Minutes of Mediation Proceedings</h2>
        <p className="text-center text-sm text-foreground-muted mb-8">
          {caseData.title} (Reference No. {caseData.reference_number})
        </p>
        {sessions.length === 0 && <p className="text-foreground-muted mb-6">No hearing sessions recorded yet.</p>}
        {sessions.map((a, i) => {
          const schedule = schedules.find((s) => s.id === a.schedule_id);
          return (
            <div key={a.id} className="mb-6 pb-6 border-b border-foreground/20 last:border-0">
              <p className="font-semibold mb-2">
                Session {i + 1} — {schedule ? formatDate(schedule.scheduled_at) : formatDate(a.created_at)}
              </p>
              <table className="w-full text-sm mb-3">
                <tbody>
                  <tr>
                    <td className="py-1 pr-4 text-foreground-muted w-40">Complainant</td>
                    <td className="py-1">{a.complainant_attendance || "—"}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4 text-foreground-muted">Respondent</td>
                    <td className="py-1">{a.respondent_attendance || "—"}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4 text-foreground-muted align-top">Pangkat/Lupon</td>
                    <td className="py-1">{a.lupon_attendance || "—"}</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-sm">
                <span className="text-foreground-muted">Decision/Remarks:</span> {a.remarks || "None recorded"}
              </p>
            </div>
          );
        })}
        <div className="grid grid-cols-2 gap-8 mt-4">
          <SignatureLine label="Punong Barangay / Pangkat Chairperson" />
          <SignatureLine label="Barangay/Lupon Secretary" />
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="text-center font-display text-xl font-semibold uppercase mb-8">Case Summary</h2>
      <table className="w-full text-sm mb-6">
        <tbody>
          <tr>
            <td className="py-1 pr-4 text-foreground-muted align-top w-40">Type</td>
            <td className="py-1">{caseData.type}</td>
          </tr>
          <tr>
            <td className="py-1 pr-4 text-foreground-muted align-top">Status</td>
            <td className="py-1">{caseData.status}</td>
          </tr>
          <tr>
            <td className="py-1 pr-4 text-foreground-muted align-top">Category</td>
            <td className="py-1">{caseData.category?.name || "Uncategorized"}</td>
          </tr>
          <tr>
            <td className="py-1 pr-4 text-foreground-muted align-top">Complainant</td>
            <td className="py-1">{complainantName}</td>
          </tr>
          <tr>
            <td className="py-1 pr-4 text-foreground-muted align-top">Respondent</td>
            <td className="py-1">{respondentName}</td>
          </tr>
        </tbody>
      </table>
      <h3 className="font-semibold mb-1">Narrative</h3>
      <p className="mb-4 leading-relaxed whitespace-pre-wrap">{caseData.narrative}</p>
      <h3 className="font-semibold mb-1">Relief requested</h3>
      <p className="leading-relaxed whitespace-pre-wrap">{caseData.relief || "—"}</p>
    </>
  );
}

function PrintDocument({ id }) {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "Summons";
  const profile = useCurrentProfile();

  const [caseData, setCaseData] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [barangay, setBarangay] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch(`/complaints/${id}`),
      apiFetch(`/complaints/${id}/schedules`).catch(() => []),
      apiFetch(`/complaints/${id}/attendance`).catch(() => []),
      apiFetch("/settings/public").catch(() => ({})),
    ])
      .then(([complaint, sched, att, settings]) => {
        setCaseData(complaint);
        setSchedules(sched);
        setAttendance(att);
        setBarangay(settings);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6 text-foreground-muted">Loading…</p>;
  if (error) return <p className="p-6 text-danger">{error}</p>;
  if (!caseData) return null;
  if (profile && !STAFF_ROLES.includes(profile.role)) {
    return <p className="p-6 text-danger">Only barangay staff can print official case documents.</p>;
  }

  const upcomingSchedule = [...schedules]
    .filter((s) => new Date(s.scheduled_at) >= new Date())
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];

  return (
    <div className="min-h-screen bg-muted print:bg-white">
      <div className="print:hidden bg-white/90 border-b border-border px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
        <Link href={`/dashboard/cases/${id}`} className="text-sm font-medium text-primary hover:underline">
          ← Back to case
        </Link>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-foreground-muted">Document:</span>
            <select
              value={type}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                params.set("type", e.target.value);
                window.location.search = params.toString();
              }}
              className="border border-border rounded-sm px-2 py-1.5 bg-white"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <button
            onClick={() => window.print()}
            className="bg-primary text-white rounded-sm px-4 min-h-11 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Print
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white p-10 my-6 print:my-0 print:max-w-none shadow-sm print:shadow-none text-foreground">
        <div className="text-center mb-8">
          <p className="text-xs tracking-wide uppercase">Republic of the Philippines</p>
          <p className="font-display text-lg font-semibold mt-1">{barangay.barangay_name || "Barangay"}</p>
          {barangay.barangay_address && <p className="text-xs mt-0.5">{barangay.barangay_address}</p>}
          <p className="text-xs mt-2 tracking-wide uppercase">Office of the Lupong Tagapamayapa</p>
        </div>

        <p className="text-sm mb-6">
          <span className="ref-number">{caseData.reference_number}</span>
          <span className="float-right">{formatDate(new Date())}</span>
        </p>

        <DocumentBody
          type={type}
          caseData={caseData}
          upcomingSchedule={upcomingSchedule}
          schedules={schedules}
          attendance={attendance}
        />
      </div>
    </div>
  );
}

export default function CasePrintPage({ params }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<p className="p-6 text-foreground-muted">Loading…</p>}>
      <PrintDocument id={id} />
    </Suspense>
  );
}
