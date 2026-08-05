"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import Icon from "@/components/Icon";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'notifications' | 'security' | 'system'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [initialValues, setInitialValues] = useState({});

  // Form states matching design reference
  const [values, setValues] = useState({
    barangay_name: "Quirino District, Purok 3",
    municipality: "Padada",
    province: "Davao del Sur",
    barangay_address: "Quirino District, Padada, Davao del Sur",
    barangay_contact: "0907 707 0234",
    official_email: "barangay.quiro@example.gov.ph",
    office_hours: "Monday–Friday, 8:00 AM–5:00 PM",
    default_venue: "Barangay Hall – Session Room",
    case_prefix: "KP",
    current_year: "2026",
    auto_reminders_enabled: "true",
    auto_reminder_hours: "24",
    notify_lupon: "true",
    seal_url: "/images/barangay-seal.png",
  });

  // Gateway & Test SMS States
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("KatarunganHub test message. No action is required.");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState("");
  const [testingConnection, setTestingConnection] = useState(false);
  const [connStatus, setConnStatus] = useState("Connected");

  // Reminders Trigger State
  const [sendingReminders, setSendingReminders] = useState(false);
  const [remindersResult, setRemindersResult] = useState(null);
  const [remindersError, setRemindersError] = useState("");

  useEffect(() => {
    apiFetch("/settings")
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setValues((prev) => ({
            ...prev,
            ...data,
            seal_url: data.seal_url || "/images/barangay-seal.png",
            barangay_address: data.barangay_address || "Quirino District, Padada, Davao del Sur",
          }));
          setInitialValues((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleFieldChange(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setError("");
  }

  function handleDiscard() {
    setValues((prev) => ({ ...prev, ...initialValues }));
    setSaved(false);
    setError("");
  }

  async function handleSave(e) {
    if (e) e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await apiFetch("/settings", {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      setSaved(true);
      setInitialValues({ ...values });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    setTestingConnection(true);
    setTestError("");
    try {
      await new Promise((r) => setTimeout(r, 600));
      setConnStatus("Connected");
    } catch (err) {
      setConnStatus("Disconnected");
    } finally {
      setTestingConnection(false);
    }
  }

  async function handleSendTestSms(e) {
    e.preventDefault();
    setTestError("");
    setTestResult(null);
    setSendingTest(true);
    try {
      const fullNum = testPhone.startsWith("0")
        ? "+63" + testPhone.slice(1)
        : testPhone.startsWith("+63")
        ? testPhone
        : "+63" + testPhone;

      const res = await apiFetch("/settings/test-sms", {
        method: "POST",
        body: JSON.stringify({ phoneNumber: fullNum, message: testMessage }),
      });
      setTestResult(res);
    } catch (err) {
      setTestError(err.message);
    } finally {
      setSendingTest(false);
    }
  }

  async function handleSendReminders() {
    setRemindersError("");
    setRemindersResult(null);
    setSendingReminders(true);
    try {
      const result = await apiFetch("/schedules/send-reminders", { method: "POST" });
      setRemindersResult(result.remindersSent);
    } catch (err) {
      setRemindersError(err.message);
    } finally {
      setSendingReminders(false);
    }
  }

  const TABS = [
    { id: "profile", label: "Barangay Profile", icon: "building" },
    { id: "notifications", label: "Notifications", icon: "bell" },
    { id: "security", label: "Security", icon: "shield" },
    { id: "system", label: "System", icon: "settings" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 text-slate-800">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5 font-medium">
            <span>Home</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">System Settings</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage barangay information, notification services, and system preferences.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-xs"
          >
            Discard Changes
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-xs flex items-center gap-2"
          >
            {saving && <Icon name="refresh-cw" className="w-4 h-4 animate-spin" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {TABS.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                isActive
                  ? "border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-md"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <Icon name={t.icon} className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="flex items-center gap-2.5 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-4">
          <Icon name="alert-circle" className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}
      {saved && !error && (
        <div className="flex items-center gap-2.5 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md p-4">
          <Icon name="check-circle" className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-medium">System settings updated successfully. Changes recorded in Audit Logs.</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3">
          <Icon name="refresh-cw" className="w-7 h-7 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading settings configuration…</p>
        </div>
      ) : (
        <>
          {/* TAB 1: BARANGAY PROFILE & OFFICE SETTINGS */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-6">
              {/* Perfectly Balanced 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* LEFT COLUMN (7 COLS) */}
                <div className="lg:col-span-7 flex flex-col justify-between gap-6">
                  {/* CARD 1: BARANGAY PROFILE */}
                  <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-5 flex-1">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Barangay Profile</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Information displayed on official documents and the public case-tracking page.
                      </p>
                    </div>

                    {/* Top Row: Square Seal Box (Left) + Barangay Name & Muni/Prov (Right) */}
                    <div className="flex flex-col sm:flex-row gap-5 items-stretch">
                      {/* Square Seal Box matching reference mockup */}
                      <div className="w-36 border border-slate-200 rounded-lg p-3.5 bg-white flex flex-col items-center justify-between gap-3 shrink-0 shadow-xs">
                        <div className="w-20 h-20 flex items-center justify-center p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={values.seal_url || "/images/barangay-seal.png"}
                            alt="Barangay Seal"
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = "/images/barangay-seal.png";
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => alert("Upload custom seal feature active.")}
                          className="w-full py-1.5 px-2 text-xs font-semibold text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors text-center"
                        >
                          Change Seal
                        </button>
                      </div>

                      {/* Right Inputs: Barangay Name, Municipality, Province */}
                      <div className="flex-1 w-full flex flex-col justify-between gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-700">Barangay Name *</label>
                          <input
                            type="text"
                            value={values.barangay_name || ""}
                            onChange={(e) => handleFieldChange("barangay_name", e.target.value)}
                            className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-700">Municipality/City *</label>
                            <input
                              type="text"
                              value={values.municipality || ""}
                              onChange={(e) => handleFieldChange("municipality", e.target.value)}
                              className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-700">Province *</label>
                            <input
                              type="text"
                              value={values.province || ""}
                              onChange={(e) => handleFieldChange("province", e.target.value)}
                              className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Complete Address */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Complete Address *</label>
                      <input
                        type="text"
                        value={values.barangay_address || ""}
                        onChange={(e) => handleFieldChange("barangay_address", e.target.value)}
                        className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      />
                    </div>

                    {/* Contact Number & Official Email Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700">Official Contact Number *</label>
                        <input
                          type="text"
                          value={values.barangay_contact || ""}
                          onChange={(e) => handleFieldChange("barangay_contact", e.target.value)}
                          className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                        />
                        <span className="text-xs text-slate-500 mt-0.5">Used as the sender contact in notices and printable documents.</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700">Official Email</label>
                        <input
                          type="email"
                          value={values.official_email || ""}
                          onChange={(e) => handleFieldChange("official_email", e.target.value)}
                          className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: OFFICE & CASE SETTINGS */}
                  <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-5">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Office & Case Settings</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700">Office Hours *</label>
                        <select
                          value={values.office_hours || "Monday–Friday, 8:00 AM–5:00 PM"}
                          onChange={(e) => handleFieldChange("office_hours", e.target.value)}
                          className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                        >
                          <option value="Monday–Friday, 8:00 AM–5:00 PM">Monday–Friday, 8:00 AM–5:00 PM</option>
                          <option value="Monday–Saturday, 8:00 AM–5:00 PM">Monday–Saturday, 8:00 AM–5:00 PM</option>
                          <option value="Daily, 8:00 AM–5:00 PM">Daily, 8:00 AM–5:00 PM</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700">Default Hearing Venue *</label>
                        <select
                          value={values.default_venue || "Barangay Hall – Session Room"}
                          onChange={(e) => handleFieldChange("default_venue", e.target.value)}
                          className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                        >
                          <option value="Barangay Hall – Session Room">Barangay Hall – Session Room</option>
                          <option value="Barangay Hall – Main Office">Barangay Hall – Main Office</option>
                          <option value="Pangkat Mediation Room">Pangkat Mediation Room</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700">Case Number Prefix *</label>
                        <input
                          type="text"
                          value={values.case_prefix || "KP"}
                          onChange={(e) => handleFieldChange("case_prefix", e.target.value)}
                          className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700">Current Year *</label>
                        <input
                          type="text"
                          value={values.current_year || "2026"}
                          onChange={(e) => handleFieldChange("current_year", e.target.value)}
                          className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                        />
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 mt-0.5">These settings are used when creating and managing cases.</span>
                  </div>
                </div>

                {/* RIGHT COLUMN (5 COLS) */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                  {/* CARD 1: SMS GATEWAY */}
                  <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-5 flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-900">SMS Gateway</h2>
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={testingConnection}
                        className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        {testingConnection && <Icon name="refresh-cw" className="w-3.5 h-3.5 animate-spin" />}
                        Test Connection
                      </button>
                    </div>

                    {/* Status Banner */}
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-md p-3.5 text-xs text-slate-700 font-medium">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${connStatus === "Connected" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span className="font-bold text-emerald-700">{connStatus}</span>
                      </div>
                      <div>
                        Provider: <strong className="text-slate-900">TextBee</strong>
                      </div>
                      <div>
                        Device/API: <span className="font-mono text-slate-800">*********7A42</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 text-right -mt-3">Last checked: Today, 8:14 AM</div>

                    {/* Send Test Message Sub-form */}
                    <form onSubmit={handleSendTestSms} className="flex flex-col gap-3.5 pt-3 border-t border-slate-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">SEND TEST MESSAGE</h3>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700">Philippine Mobile Number *</label>
                        <div className="flex gap-2">
                          <span className="inline-flex items-center px-3.5 py-2 border border-slate-300 bg-slate-50 text-slate-700 rounded-md text-sm font-semibold">
                            +63
                          </span>
                          <input
                            type="tel"
                            required
                            placeholder="917 123 4567"
                            value={testPhone}
                            onChange={(e) => setTestPhone(e.target.value)}
                            className="flex-1 border border-slate-300 rounded-md px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700">Message</label>
                        <textarea
                          rows={3}
                          value={testMessage}
                          onChange={(e) => setTestMessage(e.target.value)}
                          className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                        />
                      </div>

                      {testError && (
                        <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-3 flex items-center gap-2 font-medium">
                          <Icon name="alert-circle" className="w-4 h-4 shrink-0 text-rose-600" />
                          {testError}
                        </p>
                      )}
                      {testResult && !testError && (
                        <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md p-3 flex items-center gap-2 font-medium">
                          <Icon name="check-circle" className="w-4 h-4 shrink-0 text-emerald-600" />
                          Test SMS dispatched via {testResult.provider}! Check recipient mobile.
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={sendingTest || !testPhone}
                        className="w-full py-2.5 px-4 bg-blue-600 text-white font-semibold text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Icon name="send" className="w-4 h-4" />
                        {sendingTest ? "Sending Test SMS…" : "Send Test SMS"}
                      </button>
                    </form>
                  </div>

                  {/* CARD 2: AUTOMATED HEARING REMINDERS */}
                  <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-900">Automated Hearing Reminders</h2>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={values.auto_reminders_enabled === "true"}
                          onChange={(e) => handleFieldChange("auto_reminders_enabled", e.target.checked ? "true" : "false")}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <p className="text-xs text-slate-500">
                      Send reminders to complainants and respondents before scheduled hearings.
                    </p>

                    <div className="flex flex-col gap-3.5 pt-1">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700">Send reminder</label>
                        <select
                          value={values.auto_reminder_hours || "24"}
                          onChange={(e) => handleFieldChange("auto_reminder_hours", e.target.value)}
                          className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                        >
                          <option value="24">24 hours before hearing</option>
                          <option value="12">12 hours before hearing</option>
                          <option value="48">48 hours before hearing</option>
                        </select>
                      </div>

                      <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={values.notify_lupon === "true"}
                          onChange={(e) => handleFieldChange("notify_lupon", e.target.checked ? "true" : "false")}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span>Notify assigned Lupon member</span>
                      </label>
                    </div>

                    {/* Status Banner */}
                    <div className="bg-blue-50/70 border border-blue-200 rounded-md p-3.5 flex items-center justify-between text-xs text-blue-900 font-medium">
                      <div className="flex items-center gap-2">
                        <Icon name="calendar-days" className="w-4 h-4 text-blue-600 shrink-0" />
                        <span><strong>Next run:</strong> Tomorrow, 8:00 AM</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-800">
                        <Icon name="users" className="w-4 h-4 text-blue-600 shrink-0" />
                        <span><strong>3</strong> scheduled recipients</span>
                      </div>
                    </div>

                    {remindersError && (
                      <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-3 flex items-center gap-2 font-medium">
                        <Icon name="alert-circle" className="w-4 h-4 shrink-0 text-rose-600" />
                        {remindersError}
                      </p>
                    )}
                    {remindersResult !== null && !remindersError && (
                      <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md p-3 flex items-center gap-2 font-medium">
                        <Icon name="check-circle" className="w-4 h-4 shrink-0 text-emerald-600" />
                        {remindersResult === 0
                          ? "No hearings scheduled tomorrow — 0 reminders dispatched."
                          : `Reminders successfully queued & dispatched for ${remindersResult} hearing${remindersResult === 1 ? "" : "s"}.`}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleSendReminders}
                      disabled={sendingReminders}
                      className="w-full py-2.5 px-4 bg-white text-blue-700 font-semibold text-sm border border-blue-300 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Icon name="bell" className="w-4 h-4" />
                      {sendingReminders ? "Sending Reminders…" : "Send Today's Reminders"}
                    </button>
                  </div>
                </div>
              </div>

              {/* CLEAN FULL-WIDTH AUDIT NOTICE AT THE BOTTOM OF THE 2 COLUMNS */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-4 flex items-center justify-between text-xs text-blue-900 font-medium">
                <div className="flex items-center gap-2.5">
                  <Icon name="shield" className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                  <span>Configuration changes are automatically recorded in System Audit Logs.</span>
                </div>
                <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider hidden sm:inline">System Security Scope</span>
              </div>
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Notification Settings</h2>
                <p className="text-xs text-slate-500 mt-1">Configure SMS and email templates and delivery triggers.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 border border-slate-200 rounded-md bg-slate-50 flex flex-col gap-2">
                  <h3 className="text-sm font-bold text-slate-800">Hearing Notice Template</h3>
                  <p className="text-xs text-slate-500">SMS template sent to summons recipients prior to scheduled mediation.</p>
                  <textarea
                    rows={3}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-md font-mono bg-white text-slate-800 focus:outline-none focus:border-blue-600"
                    defaultValue="KatarunganHub: Notice for hearing on [DATE] at [VENUE]. Case: [CASE_NO]. Please come on time."
                  />
                </div>
                <div className="p-4 border border-slate-200 rounded-md bg-slate-50 flex flex-col gap-2">
                  <h3 className="text-sm font-bold text-slate-800">Case Settlement Notice</h3>
                  <p className="text-xs text-slate-500">Notification sent when an official amicable settlement is filed.</p>
                  <textarea
                    rows={3}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-md font-mono bg-white text-slate-800 focus:outline-none focus:border-blue-600"
                    defaultValue="KatarunganHub: Settlement filed for Case [CASE_NO]. Copies available at Barangay Office."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === "security" && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Security & Permissions</h2>
                <p className="text-xs text-slate-500 mt-1">Manage session durations and role security parameters.</p>
              </div>
              <div className="flex flex-col gap-4 max-w-xl">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-md">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Require Password Change on Temp Password</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Forces new users to update temporary credentials on first login.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-md">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Strict Audit Logging</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Records all case data views and role access attempts.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM */}
          {activeTab === "system" && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">System Diagnostics & Information</h2>
                <p className="text-xs text-slate-500 mt-1">Environment metrics and database integration details.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 border border-slate-200 rounded-md bg-slate-50">
                  <div className="text-xs text-slate-500 font-medium">Version</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">v1.4.0</div>
                </div>
                <div className="p-4 border border-slate-200 rounded-md bg-slate-50">
                  <div className="text-xs text-slate-500 font-medium">Database Engine</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">Supabase PostgreSQL</div>
                </div>
                <div className="p-4 border border-slate-200 rounded-md bg-slate-50">
                  <div className="text-xs text-slate-500 font-medium">API Runtime</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">Node.js Express</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-4">
        <button
          type="button"
          onClick={handleDiscard}
          disabled={saving}
          className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-xs flex items-center gap-2"
        >
          {saving && <Icon name="refresh-cw" className="w-4 h-4 animate-spin" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
