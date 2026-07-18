"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import UserPicker from "@/components/UserPicker";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

const TYPE_STYLES = {
  Summons: "border-l-4 border-l-[#0038a8] bg-[#0038a81f] text-[#0038a8]",
  "Punong Barangay mediation": "border-l-4 border-l-[#c9a227] bg-[#c9a2271f] text-[#9c7d1e]",
  "Pangkat conciliation": "border-l-4 border-l-[#3f6b4b] bg-[#3f6b4b1f] text-[#3f6b4b]",
  "Follow-up conference": "border-l-4 border-l-[#c8102e] bg-[#c8102e1f] text-[#c8102e]",
};
const DEFAULT_TYPE_STYLE = "border-l-4 border-l-border bg-muted text-foreground-muted";

function monthCells(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function SchedulesPage() {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [schedules, setSchedules] = useState([]);
  const [cases, setCases] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ caseId: "", type: "Summons", scheduledAt: "", venue: "Barangay Hall", facilitatorId: "" });
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([apiFetch("/schedules"), apiFetch("/complaints")])
      .then(([scheduleData, caseData]) => {
        setSchedules(scheduleData);
        setCases(caseData.filter((c) => c.status !== "Closed"));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function shiftMonth(delta) {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function goToday() {
    setCursor({ year: today.getFullYear(), month: today.getMonth() });
  }

  async function handleAddSchedule(e) {
    e.preventDefault();
    if (!form.caseId) return;
    setAddError("");
    setAdding(true);
    try {
      await apiFetch(`/complaints/${form.caseId}/schedules`, {
        method: "POST",
        body: JSON.stringify({
          type: form.type,
          scheduledAt: form.scheduledAt,
          venue: form.venue,
          facilitatorId: form.facilitatorId || undefined,
        }),
      });
      setForm({ caseId: "", type: "Summons", scheduledAt: "", venue: "Barangay Hall", facilitatorId: "" });
      setShowAddForm(false);
      load();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  }

  const byDay = {};
  for (const s of schedules) {
    const dt = new Date(s.scheduled_at);
    if (dt.getFullYear() === cursor.year && dt.getMonth() === cursor.month) {
      (byDay[dt.getDate()] ||= []).push(s);
    }
  }

  const cells = monthCells(cursor.year, cursor.month);
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Mediation Schedule</h1>
          <p className="text-foreground-muted mt-1">All upcoming hearings and mediations across cases.</p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 px-4 py-2 text-sm font-medium whitespace-nowrap"
        >
          {showAddForm ? "Cancel" : "+ Add Schedule"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSchedule} className="bg-white/90 rounded-sm border border-border p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Case</span>
            <select
              required
              value={form.caseId}
              onChange={(e) => setForm({ ...form, caseId: e.target.value })}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            >
              <option value="">Select case</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.reference_number} — {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            >
              {Object.keys(TYPE_STYLES).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Date &amp; time</span>
            <input
              required
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Venue</span>
            <input
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Facilitator (optional)</span>
            <UserPicker
              roles={STAFF_ROLES}
              value={form.facilitatorId}
              onChange={(v) => setForm({ ...form, facilitatorId: v })}
              placeholder="Select facilitator"
            />
          </label>
          {addError && <p className="text-danger text-sm sm:col-span-2">{addError}</p>}
          <button
            type="submit"
            disabled={adding}
            className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 py-2 font-medium sm:col-span-2 disabled:opacity-60"
          >
            {adding ? "Saving…" : "Save schedule"}
          </button>
        </form>
      )}

      {loading && <p className="text-foreground-muted">Loading…</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <div className="bg-white/90 rounded-sm border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToday}
                className="min-h-9 px-3 text-sm rounded-sm border border-border hover:bg-muted focus-visible:outline-3 focus-visible:outline-primary"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className="min-h-9 min-w-9 rounded-sm border border-border hover:bg-muted focus-visible:outline-3 focus-visible:outline-primary"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className="min-h-9 min-w-9 rounded-sm border border-border hover:bg-muted focus-visible:outline-3 focus-visible:outline-primary"
              >
                ›
              </button>
            </div>
            <h2 className="font-display text-lg font-semibold">{monthLabel}</h2>
          </div>

          <div className="grid grid-cols-7 text-xs font-medium tracking-wide uppercase text-foreground-muted border-b border-border">
            {WEEKDAYS.map((w) => (
              <div key={w} className="px-2 py-2 text-center">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const isToday =
                day &&
                cursor.year === today.getFullYear() &&
                cursor.month === today.getMonth() &&
                day === today.getDate();

              return (
                <div
                  key={i}
                  className={`min-h-[6.5rem] border-b border-r border-border p-1.5 ${day ? "" : "bg-muted/40"}`}
                >
                  {day && (
                    <>
                      <span
                        className={`text-xs inline-flex items-center justify-center w-5 h-5 rounded-full ${
                          isToday ? "bg-primary text-white" : "text-foreground-muted"
                        }`}
                      >
                        {day}
                      </span>
                      <ul className="mt-1 flex flex-col gap-1">
                        {(byDay[day] || []).map((s) => (
                          <li key={s.id}>
                            <Link
                              href={`/dashboard/cases/${s.complaint_id}`}
                              title={`${s.type} — ${s.complaint?.reference_number || ""}`}
                              className={`block truncate text-[0.7rem] leading-tight rounded-sm pl-2 pr-1.5 py-0.5 hover:bg-primary hover:text-white hover:border-l-primary transition-colors ${
                                TYPE_STYLES[s.type] || DEFAULT_TYPE_STYLE
                              }`}
                            >
                              {new Date(s.scheduled_at).toLocaleTimeString("en-PH", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}{" "}
                              {s.type}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
