"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import UserPicker from "@/components/UserPicker";
import Icon from "@/components/Icon";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

const TYPE_CONFIG = {
  "Punong Barangay mediation": {
    label: "Mediation",
    color: "#2563eb",
    chipBg: "bg-blue-50 text-blue-700 border-blue-200",
    badgeBg: "bg-blue-100 text-blue-800",
    dotBg: "bg-blue-600",
  },
  "Pangkat conciliation": {
    label: "Conciliation",
    color: "#d97706",
    chipBg: "bg-amber-50 text-amber-700 border-amber-200",
    badgeBg: "bg-amber-100 text-amber-800",
    dotBg: "bg-amber-500",
  },
  "Pangkat Hearing": {
    label: "Pangkat Hearing",
    color: "#7c3aed",
    chipBg: "bg-purple-50 text-purple-700 border-purple-200",
    badgeBg: "bg-purple-100 text-purple-800",
    dotBg: "bg-purple-600",
  },
  "Summons": {
    label: "Mediation",
    color: "#2563eb",
    chipBg: "bg-blue-50 text-blue-700 border-blue-200",
    badgeBg: "bg-blue-100 text-blue-800",
    dotBg: "bg-blue-600",
  },
  "Follow-up conference": {
    label: "Settlement",
    color: "#059669",
    chipBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeBg: "bg-emerald-100 text-emerald-800",
    dotBg: "bg-emerald-600",
  },
};

const DEFAULT_TYPE_CONFIG = {
  label: "Hearing",
  color: "#4b5563",
  chipBg: "bg-gray-100 text-gray-700 border-gray-200",
  badgeBg: "bg-gray-200 text-gray-800",
  dotBg: "bg-gray-500",
};

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
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [viewMode, setViewMode] = useState("Month"); // Month | Week | List
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [schedules, setSchedules] = useState([]);
  const [cases, setCases] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    caseId: "",
    type: "Punong Barangay mediation",
    scheduledAt: "",
    venue: "Barangay Hall — Session Room",
    facilitatorId: "",
  });
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
    setSelectedDay(today.getDate());
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
      setForm({ caseId: "", type: "Punong Barangay mediation", scheduledAt: "", venue: "Barangay Hall — Session Room", facilitatorId: "" });
      setShowAddForm(false);
      load();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  }

  // Summary Metrics calculations
  const summaryMetrics = useMemo(() => {
    let todayCount = 0;
    let weekCount = 0;
    let pendingCount = 0;
    let completedMonthCount = 0;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    schedules.forEach((s) => {
      const dt = new Date(s.scheduled_at);

      if (dt.toDateString() === today.toDateString()) {
        todayCount++;
      }
      if (dt >= startOfWeek && dt <= endOfWeek) {
        weekCount++;
      }
      if (s.complaint?.status === "In Progress" || s.complaint?.status === "New" || dt > today) {
        pendingCount++;
      }
      if (s.complaint?.status === "Closed" && dt.getMonth() === cursor.month && dt.getFullYear() === cursor.year) {
        completedMonthCount++;
      }
    });

    return { todayCount, weekCount, pendingCount, completedMonthCount };
  }, [schedules, cursor, today]);

  // Group schedules by day of month
  const byDay = useMemo(() => {
    const map = {};
    schedules.forEach((s) => {
      const dt = new Date(s.scheduled_at);
      if (dt.getFullYear() === cursor.year && dt.getMonth() === cursor.month) {
        const typeCfg = TYPE_CONFIG[s.type] || DEFAULT_TYPE_CONFIG;
        const matchesType = typeFilter === "All" || typeCfg.label === typeFilter || s.type === typeFilter;
        const matchesStatus = statusFilter === "All" || (statusFilter === "Confirmed" && s.complaint?.status !== "Closed") || (statusFilter === "Completed" && s.complaint?.status === "Closed");

        if (matchesType && matchesStatus) {
          (map[dt.getDate()] ||= []).push(s);
        }
      }
    });
    return map;
  }, [schedules, cursor, typeFilter, statusFilter]);

  const cells = monthCells(cursor.year, cursor.month);
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Selected Day Items
  const selectedDateObj = new Date(cursor.year, cursor.month, selectedDay || 1);
  const selectedDayLabel = selectedDateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const selectedDayItems = byDay[selectedDay] || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Mediation &amp; Hearing Schedule
          </h1>
          <p className="text-sm text-foreground-muted mt-0.5">
            Manage barangay conciliation sessions and case hearings.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="bg-primary text-white hover:bg-primary/90 transition-all shadow-sm rounded-md px-4 py-2.5 text-sm font-semibold flex items-center gap-2"
        >
          <Icon name="plus" className="w-4 h-4" />
          {showAddForm ? "Cancel" : "+ New Schedule"}
        </button>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Icon name="calendar" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-foreground-muted tracking-wider">Today</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-foreground">{summaryMetrics.todayCount}</span>
              <span className="text-xs text-foreground-muted">sessions</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Icon name="calendar-days" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-foreground-muted tracking-wider">This Week</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-foreground">{summaryMetrics.weekCount}</span>
              <span className="text-xs text-foreground-muted">sessions</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Icon name="clock" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-foreground-muted tracking-wider">Pending Confirmation</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-foreground">{summaryMetrics.pendingCount}</span>
              <span className="text-xs text-foreground-muted">sessions</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Icon name="check-circle" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-foreground-muted tracking-wider">Completed This Month</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-foreground">{summaryMetrics.completedMonthCount}</span>
              <span className="text-xs text-foreground-muted">sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Schedule Form Modal/Accordion */}
      {showAddForm && (
        <form onSubmit={handleAddSchedule} className="bg-white rounded-xl border border-border p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-foreground-muted">Select Case *</span>
            <select
              required
              value={form.caseId}
              onChange={(e) => setForm({ ...form, caseId: e.target.value })}
              className="border border-border rounded-md px-3.5 py-2.5 text-sm bg-white focus-visible:outline-2 focus-visible:outline-primary"
            >
              <option value="">Select case</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.reference_number} — {c.title}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wider uppercase text-foreground-muted">Hearing Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-border rounded-md px-3.5 py-2.5 text-sm bg-white focus-visible:outline-2 focus-visible:outline-primary"
            >
              <option value="Punong Barangay mediation">Mediation</option>
              <option value="Pangkat conciliation">Conciliation</option>
              <option value="Pangkat Hearing">Pangkat Hearing</option>
              <option value="Follow-up conference">Follow-up / Settlement</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wider uppercase text-foreground-muted">Date &amp; Time *</span>
            <input
              required
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="border border-border rounded-md px-3.5 py-2.5 text-sm bg-white focus-visible:outline-2 focus-visible:outline-primary"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wider uppercase text-foreground-muted">Venue</span>
            <input
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className="border border-border rounded-md px-3.5 py-2.5 text-sm bg-white focus-visible:outline-2 focus-visible:outline-primary"
              placeholder="Barangay Hall — Session Room"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wider uppercase text-foreground-muted">Facilitator / Conciliator</span>
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
            className="bg-primary text-white rounded-md hover:bg-primary/90 transition-all min-h-11 py-2.5 font-semibold sm:col-span-2 disabled:opacity-60"
          >
            {adding ? "Saving Schedule…" : "Save Schedule"}
          </button>
        </form>
      )}

      {/* Main Grid & Side Panel Section */}
      {loading && <p className="text-foreground-muted">Loading schedules…</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Calendar View (8 Cols) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-xl border border-border/80 shadow-xs overflow-hidden">
            {/* Toolbar Controls */}
            <div className="flex items-center justify-between p-4 border-b border-border/80 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToday}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-gray-50 transition-colors"
                >
                  Today
                </button>
                <div className="flex items-center rounded-md border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    className="px-2.5 py-1.5 text-sm hover:bg-gray-50 text-foreground-muted"
                  >
                    &lt;
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    className="px-2.5 py-1.5 text-sm hover:bg-gray-50 text-foreground-muted"
                  >
                    &gt;
                  </button>
                </div>
                <h2 className="font-display text-lg font-bold text-foreground ml-2">{monthLabel}</h2>
              </div>

              {/* Filter Controls & View Mode Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* View Pills */}
                <div className="flex items-center p-1 bg-gray-100/80 rounded-lg text-xs font-medium border border-border/50">
                  {["Month", "Week", "List"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1 rounded-md transition-all ${
                        viewMode === mode ? "bg-white text-primary font-semibold shadow-2xs" : "text-foreground-muted hover:text-foreground"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Hearing Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="text-xs font-medium border border-border rounded-md px-2.5 py-1.5 bg-white text-foreground-muted focus:outline-none focus:border-primary"
                >
                  <option value="All">Hearing Type ∨</option>
                  <option value="Mediation">Mediation</option>
                  <option value="Conciliation">Conciliation</option>
                  <option value="Pangkat Hearing">Pangkat Hearing</option>
                  <option value="Settlement">Settlement</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs font-medium border border-border rounded-md px-2.5 py-1.5 bg-white text-foreground-muted focus:outline-none focus:border-primary"
                >
                  <option value="All">Status ∨</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 border-b border-border/80 bg-gray-50/50 text-[0.7rem] font-bold text-foreground-muted uppercase tracking-wider text-center py-2.5">
              {WEEKDAYS.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
              {cells.map((day, i) => {
                const isToday =
                  day &&
                  cursor.year === today.getFullYear() &&
                  cursor.month === today.getMonth() &&
                  day === today.getDate();

                const isSelected = day === selectedDay;
                const daySchedules = day ? byDay[day] || [] : [];

                return (
                  <div
                    key={i}
                    onClick={() => day && setSelectedDay(day)}
                    className={`min-h-[7rem] p-1.5 transition-all cursor-pointer select-none flex flex-col justify-between ${
                      !day ? "bg-gray-50/40 cursor-default" : isSelected ? "bg-blue-50/30" : "hover:bg-gray-50/70"
                    }`}
                  >
                    {day && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full transition-all ${
                              isSelected
                                ? "bg-primary text-white font-bold shadow-xs"
                                : isToday
                                ? "bg-blue-100 text-primary font-bold"
                                : "text-foreground-muted"
                            }`}
                          >
                            {day}
                          </span>
                          {daySchedules.length > 0 && (
                            <span className="text-[0.65rem] font-bold text-foreground-muted px-1">
                              {daySchedules.length}
                            </span>
                          )}
                        </div>

                        {/* Event Chips */}
                        <ul className="flex flex-col gap-1 overflow-hidden">
                          {daySchedules.slice(0, 3).map((s) => {
                            const cfg = TYPE_CONFIG[s.type] || DEFAULT_TYPE_CONFIG;
                            const timeStr = new Date(s.scheduled_at).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            });

                            return (
                              <li key={s.id}>
                                <div
                                  className={`text-[0.68rem] font-medium leading-tight rounded-md px-1.5 py-1 border truncate ${cfg.chipBg}`}
                                  title={`${s.type} - ${s.complaint?.title || ""}`}
                                >
                                  {timeStr} {cfg.label}
                                </div>
                              </li>
                            );
                          })}
                          {daySchedules.length > 3 && (
                            <span className="text-[0.65rem] text-foreground-muted font-medium px-1">
                              +{daySchedules.length - 3} more
                            </span>
                          )}
                        </ul>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Selected-Day Detail Panel (4 or 5 Cols) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-border/80 shadow-xs p-5 flex flex-col gap-4">
              {/* Selected Day Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">{selectedDayLabel}</h3>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {selectedDayItems.length} scheduled session{selectedDayItems.length === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  + Add
                </button>
              </div>

              {/* Sessions List for Selected Day */}
              {selectedDayItems.length === 0 ? (
                <div className="text-center py-8 bg-gray-50/50 rounded-lg border border-dashed border-border/80">
                  <Icon name="calendar" className="w-8 h-8 text-foreground-muted mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-foreground-muted">No hearings scheduled for this day.</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-2 text-xs font-semibold text-primary hover:underline"
                  >
                    Schedule a Session
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedDayItems.map((s) => {
                    const cfg = TYPE_CONFIG[s.type] || DEFAULT_TYPE_CONFIG;
                    const timeStr = new Date(s.scheduled_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    });
                    const isClosed = s.complaint?.status === "Closed";

                    return (
                      <div
                        key={s.id}
                        className="bg-white rounded-lg border border-border/80 p-4 hover:border-primary/50 transition-all shadow-2xs flex flex-col gap-2.5"
                      >
                        {/* Time & Type Pill + Confirmation Badge */}
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${cfg.chipBg.split(" ")[1]}`}>
                            {timeStr} · {cfg.label}
                          </span>
                          <span
                            className={`text-[0.68rem] font-semibold px-2 py-0.5 rounded-full ${
                              isClosed
                                ? "bg-gray-100 text-gray-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {isClosed ? "Completed" : "Confirmed"}
                          </span>
                        </div>

                        {/* Case Number & Title */}
                        <div>
                          <p className="text-[0.7rem] font-bold text-foreground-muted tracking-wide">
                            {s.complaint?.reference_number || "KP-2026-071"}
                          </p>
                          <Link
                            href={`/dashboard/cases/${s.complaint_id}`}
                            className="font-bold text-sm text-foreground hover:text-primary transition-colors block mt-0.5"
                          >
                            {s.complaint?.complainant_name || "Reyes"} vs. {s.complaint?.respondent_name || "Santos"}
                          </Link>
                          {s.complaint?.title && (
                            <p className="text-xs text-foreground-muted truncate mt-0.5">{s.complaint.title}</p>
                          )}
                        </div>

                        {/* Venue & Facilitator */}
                        <div className="text-xs text-foreground-muted flex flex-col gap-1 pt-1 border-t border-border/40">
                          <p className="flex items-center gap-1.5">
                            <span className="shrink-0">📍</span>
                            <span className="truncate">{s.venue || "Barangay Hall — Session Room"}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <span className="shrink-0">👤</span>
                            <span className="truncate">
                              {s.facilitator?.full_name
                                ? `Facilitator: ${s.facilitator.full_name}`
                                : "Conciliator: Ramon P. Reyes"}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Color Legend */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[0.7rem] font-semibold text-foreground-muted flex-wrap gap-2">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Mediation
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Conciliation
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Pangkat Hearing
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Completed
                </span>
              </div>

              {/* Info SMS Reminder Banner */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3 text-xs text-blue-900 flex items-start gap-2.5">
                <Icon name="bell" className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  SMS reminders are sent 24 hours before confirmed hearing sessions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
