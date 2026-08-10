"use client";

import { useState, useRef, useEffect } from "react";
import Icon from "@/components/Icon";

const SUGGESTED_QUESTIONS = [
  {
    icon: "scale",
    label: "Covered ba sa Lupon ang away sa utang o bakud?",
    question: "Covered ba sa Lupon ang away sa utang o boundary sa bakud?",
  },
  {
    icon: "file-text",
    label: "Unsa ang Non-Lupon Cases ug ngano gi-refer?",
    question: "Unsa ang Non-Lupon Cases ug ngano gi-refer kini sa court o PNP?",
  },
  {
    icon: "clock",
    label: "Pila ka adlaw ang mediation ug conciliation timelines?",
    question: "Pila ka adlaw ang mandatory mediation ug conciliation sa R.A. 7160?",
  },
  {
    icon: "help-circle",
    label: "Unsa nga requirements ang i-andam sa pag-file?",
    question: "Unsa nga mga requirements ang kinahanglan i-andam sa pag-file ug reklamo?",
  },
];

const INITIAL_MESSAGES = [
  {
    sender: "bot",
    text: "Maayong adlaw! Ako ang **KatarunganAI Assistant** 🤖.\n\nNaka-train ako sa **Republic Act 7160 (Katarungang Pambarangay Law)**. Pwede ka mangutana sa **Bisaya, Tagalog, o English** bahin sa reklamo, Lupon jurisdiction, ug KP Forms!",
    time: "Just now",
  },
];

export default function KatarunganAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  function generateAIResponse(userText) {
    const query = userText.toLowerCase();

    // 1. Non-Lupon Cases & Court Referrals
    if (query.includes("non-lupon") || query.includes("non lupon") || query.includes("refer") || query.includes("court")) {
      return (
        "⚖️ **NON-LUPON CASES (R.A. 7160 Section 408):**\n\n" +
        "Ang **Non-Lupon Cases** kay ang mga reklamo nga **walay jurisdiction ang Barangay/Lupon gikan pa sa sugod**:\n" +
        "1. Kriminal nga kaso nga ang parusa labaw sa 1 tuig nga bilanggoan o multa nga labaw ₱5,000 (e.g. Serious Physical Injuries, Homicide, Theft > ₱5k).\n" +
        "2. Kaso nga Korporasyon, Gobyerno, o Public Officer ang pikas partido.\n" +
        "3. Kaso diin ang duha ka partido nagpuyo sa magkaibang lungsod/syudad.\n\n" +
        "👉 **System Action:** Gipasa kini sa atong **5-Stage Non-Lupon Referral Engine** (*Received ➔ Assigned ➔ In Progress ➔ Referred ➔ Closed*) para sa direktang pag-refer sa PNP o Court!"
      );
    }

    // 2. Loan, Debt, Noise, Boundary (Lupon Jurisdiction)
    if (
      query.includes("utang") ||
      query.includes("loan") ||
      query.includes("bakud") ||
      query.includes("boundary") ||
      query.includes("karaoke") ||
      query.includes("lupon") ||
      query.includes("covered")
    ) {
      return (
        "✅ **LUPON CASES JURISDICTION (Covered sa Barangay):**\n\n" +
        "Oo, **covered sa Lupon** ang mga ordinaryong away sa silangan parehas sa:\n" +
        "• Unpaid personal loans / utang\n" +
        "• Boundary line disputes / away sa bakud\n" +
        "• Public nuisance / karaoke noise\n" +
        "• Light oral defamation / libak / slight threats\n\n" +
        "👉 **System Action:** I-process kini ubos sa atong **9-Stage Lupon Workflow Engine** (*Official Complaint Encoded ➔ Jurisdiction Review ➔ Summons ➔ PB Mediation ➔ Pangkat Conciliation ➔ Settlement Monitoring*)."
      );
    }

    // 3. Timelines (15 days PB mediation, 30 days settlement monitoring)
    if (query.includes("adlaw") || query.includes("timeline") || query.includes("mediation") || query.includes("conciliation") || query.includes("pila")) {
      return (
        "⏱️ **STATUTORY LEGAL TIMELINES (R.A. 7160):**\n\n" +
        "1. **Punong Barangay Mediation:** Mandatory **15 days** mediation hearing kauban si Kapitan.\n" +
        "2. **Pangkat Conciliation:** Mandatory **15 days** conciliation session sa 3-member Pangkat panel kon dili ma-settle ni Kapitan.\n" +
        "3. **Settlement Monitoring:** Mandatory **30 days** compliance tracking period alang sa signed Amicable Settlement Agreements (KP Form 16).\n\n" +
        "👉 Kon mapakyas ang conciliation, ang system mag-issue og **Certificate to File Action (KP Form 20 / CFA)**."
      );
    }

    // 4. Requirements for Filing
    if (query.includes("requirement") || query.includes("andam") || query.includes("file") || query.includes("unsaon") || query.includes("reklamo")) {
      return (
        "📋 **MGA REQUIREMENTS SA PAG-FILE OG REKLAMO:**\n\n" +
        "1. **Valid Government ID** (e.g. Barangay ID, Voter's ID, Driver's License).\n" +
        "2. **Kumpletong Pangalan ug Adres** sa Complainant ug Respondent.\n" +
        "3. **Ebidensya o Promissory Note** (kon utang) o larawan/blotter (kon damag/noise).\n" +
        "4. Bisita sa inyong Barangay Hall aron i-encode sa Secretary sa **KatarunganHub System**!"
      );
    }

    // Default Fallback
    return (
      "🤖 **KatarunganAI Advisory:**\n\n" +
      "Nakatala ang imong pangutana! Ubos sa **R.A. 7160 (Katarungang Pambarangay Law)**, tanang reklamo sa barangay gi-classify sa atong system isip:\n" +
      "• **Lupon Case (9 Stages):** Para sa away sa silangan, utang, o damag.\n" +
      "• **Non-Lupon Case (5 Stages):** Para sa bug-at nga kriminal nga kaso o referral sa Court/PNP.\n\n" +
      "Unsa pay laing detalye nga gusto nimong mahibaloan?"
    );
  }

  function handleSend(textToSend) {
    const userQuery = textToSend || input;
    if (!userQuery.trim()) return;

    const userMsg = {
      sender: "user",
      text: userQuery,
      time: new Date().toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiReplyText = generateAIResponse(userQuery);
      const aiMsg = {
        sender: "bot",
        text: aiReplyText,
        time: new Date().toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  }

  return (
    <aside aria-label="AI Legal Assistant" className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-gradient-to-r from-primary via-blue-700 to-indigo-800 text-white rounded-full px-4 py-3 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2.5 border border-white/20 active:scale-95"
        >
          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
            <Icon name="bot" className="w-5 h-5 text-amber-300" />
          </span>
          <div className="flex flex-col items-start text-left">
            <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1">
              Ask KatarunganAI
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider">
                AI
              </span>
            </span>
            <span className="text-[10px] text-white/80 font-medium">R.A. 7160 Legal Assistant</span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="bg-white border border-border/80 rounded-2xl shadow-2xl w-[92vw] sm:w-[410px] h-[540px] max-h-[82vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-slate-900 via-primary to-blue-900 text-white p-4 flex items-center justify-between shrink-0 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-500/30 border border-blue-400/40 flex items-center justify-center shrink-0">
                <Icon name="bot" className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                  KatarunganAI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                </h2>
                <p className="text-[10px] text-blue-200/90 font-medium">R.A. 7160 Katarungang Pambarangay Knowledge Base</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Close Chat"
            >
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50/60 flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 max-w-[88%] ${msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs mt-1">
                    🤖
                  </div>
                )}
                <div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none font-sans"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 px-1 mt-0.5 block">{msg.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="self-start flex gap-2 items-center text-xs text-slate-400 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-xs">
                <Icon name="refresh-cw" className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>KatarunganAI is thinking…</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggested Question Chips */}
          <div className="p-2.5 bg-slate-100/90 border-t border-border/60 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {SUGGESTED_QUESTIONS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.question)}
                className="bg-white hover:bg-primary/10 hover:text-primary text-slate-700 text-[11px] font-medium px-2.5 py-1.5 rounded-full border border-slate-200 shrink-0 transition-all shadow-2xs flex items-center gap-1 active:scale-95"
              >
                <Icon name={chip.icon} className="w-3 h-3 text-primary shrink-0" />
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-border/80 flex items-center gap-2 shrink-0"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask KatarunganAI (Bisaya, Tagalog, English)…"
              className="flex-1 text-xs border border-border rounded-lg px-3.5 py-2.5 bg-slate-50 focus:bg-white focus-visible:outline-2 focus-visible:outline-primary"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-primary text-white p-2.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-40 shadow-xs shrink-0 active:scale-95"
            >
              <Icon name="send" className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}
