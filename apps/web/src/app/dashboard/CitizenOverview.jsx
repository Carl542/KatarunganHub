"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import { useCurrentProfile } from "@/lib/useCurrentProfile";
import Icon from "@/components/Icon";

export default function CitizenOverview() {
  const profile = useCurrentProfile();
  const [cases, setCases] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOverviewData = () => {
    setLoading(true);
    setError("");
    Promise.all([
      apiFetch("/complaints").catch(() => []),
      apiFetch("/schedules").catch(() => []),
      apiFetch("/notifications").catch(() => []),
    ])
      .then(([complaints, schedules, notifs]) => {
        setCases(Array.isArray(complaints) ? complaints : []);
        const upcoming = (Array.isArray(schedules) ? schedules : [])
          .filter((s) => new Date(s.scheduled_at) >= new Date())
          .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
        setUpcomingSchedules(upcoming);
        setNotifications(Array.isArray(notifs) ? notifs : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  // Time-based greeting (Good morning, Good afternoon, Good evening)
  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening";

  // First name extraction
  const firstName = profile?.full_name
    ? profile.full_name.split(" ")[0]
    : "there";

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3">
        <Icon name="refresh-cw" className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-base font-semibold">Loading your dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 max-w-xl my-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-rose-800 font-bold text-lg">
          <Icon name="alert-circle" className="w-6 h-6 shrink-0 text-rose-600" />
          <span>Connection Issue</span>
        </div>
        <p className="text-base text-rose-700 font-medium">
          {error.includes("Failed to fetch")
            ? "Could not reach the server API. If the server is sleeping (Render free tier), it may take 20-30 seconds to wake up."
            : error}
        </p>
        <button
          onClick={fetchOverviewData}
          className="self-start px-5 py-2.5 bg-rose-700 text-white font-bold text-base rounded-md hover:bg-rose-800 transition-colors shadow-xs flex items-center gap-2"
        >
          <Icon name="refresh-cw" className="w-5 h-5" />
          Retry Connection
        </button>
      </div>
    );
  }

  // Active or most recent case for respondent/complainant
  const activeCase =
    cases.find((c) => c.status !== "Closed") || cases[0] || null;

  // Next hearing schedule for active case
  const nextHearing = activeCase
    ? upcomingSchedules.find((s) => s.complaint_id === activeCase.id) || upcomingSchedules[0]
    : upcomingSchedules[0];

  // Latest notification
  const latestNotif = notifications[0];

  // Step calculation for 3-step progress bar stepper
  let currentStep = 1; // 1: Filed, 2: Mediation, 3: Resolved
  if (activeCase) {
    if (activeCase.status === "Closed") {
      currentStep = 3;
    } else if (
      activeCase.status === "Under Mediation" ||
      activeCase.status === "Active" ||
      nextHearing
    ) {
      currentStep = 2;
    } else {
      currentStep = 1;
    }
  }

  // Hearing date parsing
  const hearingDateObj = nextHearing ? new Date(nextHearing.scheduled_at) : null;
  const monthAcronym = hearingDateObj
    ? hearingDateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    : "AUG";
  const dayNumber = hearingDateObj ? hearingDateObj.getDate() : "7";
  const formattedFullDate = hearingDateObj
    ? hearingDateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Friday, August 7, 2026";
  const formattedTime = hearingDateObj
    ? hearingDateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "9:00 AM";

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12 text-slate-800">
      {/* Senior-Accessible Greeting Header */}
      <div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          {timeGreeting}, {firstName}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 mt-2 font-semibold">
          Check your case status and next hearing date.
        </p>
      </div>

      {activeCase ? (
        <>
          {/* Main 2-Column Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* LEFT CARD: MY CASE (6 COLS) */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-8 shadow-xs flex flex-col justify-between gap-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">My Case</h2>

                <div className="mt-4 flex flex-col gap-1.5">
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {activeCase.reference_number || "KH-2026-005"}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-800">
                    {activeCase.title || "Public Nuisance Complaint"}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="mt-4">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-md text-sm font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                    {activeCase.status || "Under Mediation"}
                  </span>
                </div>

                <p className="text-base text-slate-700 font-semibold mt-5">
                  {currentStep === 2
                    ? "Your case is currently scheduled for mediation."
                    : currentStep === 3
                    ? "Your case has been resolved and closed."
                    : "Your case has been filed and is awaiting schedule assignment."}
                </p>

                {/* 3-Step Process Bar Stepper - Senior Friendly */}
                <div className="mt-10 mb-4 px-2">
                  <div className="relative flex items-center justify-between">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-emerald-600 -translate-y-1/2 z-0 transition-all duration-300"
                      style={{
                        width:
                          currentStep === 1
                            ? "0%"
                            : currentStep === 2
                            ? "50%"
                            : "100%",
                      }}
                    />

                    {/* Step 1: Filed */}
                    <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold transition-all ${
                          currentStep >= 1
                            ? "bg-emerald-600 text-white ring-4 ring-emerald-50"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        ✓
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        Filed
                      </span>
                    </div>

                    {/* Step 2: Mediation */}
                    <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold transition-all ${
                          currentStep >= 2
                            ? "bg-blue-600 text-white ring-4 ring-blue-50"
                            : "bg-slate-200 text-slate-500 border-2 border-slate-300"
                        }`}
                      >
                        2
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          currentStep === 2 ? "text-blue-600" : "text-slate-500"
                        }`}
                      >
                        Mediation
                      </span>
                    </div>

                    {/* Step 3: Resolved */}
                    <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold transition-all ${
                          currentStep === 3
                            ? "bg-emerald-600 text-white ring-4 ring-emerald-50"
                            : "bg-slate-100 text-slate-400 border border-slate-300"
                        }`}
                      >
                        3
                      </div>
                      <span className="text-sm font-bold text-slate-500">
                        Resolved
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* View Case Action Button */}
              <Link
                href={`/dashboard/cases/${activeCase.id}`}
                className="w-full py-3.5 px-5 bg-blue-600 text-white font-extrabold text-base rounded-lg hover:bg-blue-700 transition-colors text-center shadow-md block"
              >
                View Case Details
              </Link>
            </div>

            {/* RIGHT CARD: NEXT HEARING (6 COLS) */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-8 shadow-xs flex flex-col justify-between gap-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">Next Hearing</h2>

                {nextHearing ? (
                  <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Big Calendar Date Box */}
                    <div className="w-28 h-28 border border-slate-200 rounded-xl overflow-hidden shrink-0 shadow-md flex flex-col bg-white">
                      <div className="bg-blue-700 text-white text-sm font-extrabold text-center py-1.5 tracking-wider uppercase">
                        {monthAcronym}
                      </div>
                      <div className="flex-1 flex items-center justify-center text-4xl font-extrabold text-slate-900">
                        {dayNumber}
                      </div>
                    </div>

                    {/* Date, Time, & Venue Details */}
                    <div className="flex flex-col gap-2.5 text-base sm:text-lg text-slate-800">
                      <div className="flex items-center gap-3">
                        <Icon name="calendar" className="w-5 h-5 text-blue-600 shrink-0" />
                        <span className="font-extrabold text-slate-900">{formattedFullDate}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon name="clock" className="w-5 h-5 text-blue-600 shrink-0" />
                        <span className="font-bold text-slate-800">{formattedTime}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon name="map-pin" className="w-5 h-5 text-blue-600 shrink-0" />
                        <span className="font-bold text-slate-800">
                          {nextHearing.venue || "Barangay Hall – Session Room"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-lg text-base text-slate-600 font-medium mt-4 text-center">
                    No upcoming hearing scheduled yet for this case.
                  </div>
                )}

                {/* Blue Info Notice Banner */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-base text-blue-950 font-bold">
                  <Icon name="info" className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Please bring one valid ID and arrive 15 minutes early.</span>
                </div>
              </div>

              {/* View Details Action Button */}
              <Link
                href={activeCase ? `/dashboard/cases/${activeCase.id}` : "/dashboard/my-cases"}
                className="w-full py-3.5 px-5 bg-blue-600 text-white font-extrabold text-base rounded-lg hover:bg-blue-700 transition-colors text-center shadow-md block"
              >
                View Full Hearing Details
              </Link>
            </div>
          </div>

          {/* Bottom Reminder Notification Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Icon name="bell" className="w-5 h-5" />
              </div>
              <span className="text-base sm:text-lg font-extrabold text-slate-900">
                {latestNotif
                  ? `Reminder: ${latestNotif.message}`
                  : `Reminder: Your mediation is scheduled on ${formattedFullDate} at ${formattedTime}.`}
              </span>
            </div>
            <span className="text-sm font-bold text-slate-500">
              {latestNotif
                ? new Date(latestNotif.created_at).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "Today, 8:00 AM"}
            </span>
          </div>
        </>
      ) : (
        /* Empty state when citizen has no cases */
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center gap-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Icon name="clipboard-list" className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No Cases on Record</h2>
          <p className="text-base text-slate-600 max-w-md font-medium">
            You currently have no active or historical barangay cases registered under your profile.
          </p>
        </div>
      )}
    </div>
  );
}
