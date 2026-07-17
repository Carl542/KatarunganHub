"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/schedules")
      .then(setSchedules)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function shiftMonth(delta) {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
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
      <h1 className="font-display text-2xl font-semibold mb-1">Mediation Schedule</h1>
      <p className="text-foreground-muted mb-6">All upcoming hearings and mediations across cases.</p>

      {loading && <p className="text-foreground-muted">Loading…</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <div className="bg-white/90 rounded-sm border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="min-h-11 min-w-11 rounded-sm border border-border hover:bg-muted focus-visible:outline-3 focus-visible:outline-primary"
            >
              ‹
            </button>
            <h2 className="font-display text-lg font-semibold">{monthLabel}</h2>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="min-h-11 min-w-11 rounded-sm border border-border hover:bg-muted focus-visible:outline-3 focus-visible:outline-primary"
            >
              ›
            </button>
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
                              className="block truncate text-[0.7rem] leading-tight bg-primary-light text-primary rounded-sm px-1.5 py-0.5 hover:bg-primary hover:text-white transition-colors"
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
