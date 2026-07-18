"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Icon from "./Icon";
import BrandMark from "./BrandMark";
import { ROLES, NAV_BY_ROLE } from "@/lib/roles";

function initialsFor(fullName) {
  return (fullName || "")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function DashboardShell({ role, fullName, barangayName, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = NAV_BY_ROLE[role] || [];
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <aside className="w-64 bg-sidebar text-white flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-brass/20">
          <BrandMark size={40} />
          <div className="leading-tight">
            <span className="font-display font-semibold tracking-wide block">KatarunganHub</span>
            {barangayName && <span className="text-xs text-white/60 block">{barangayName}</span>}
          </div>
        </div>
        <nav aria-label="Primary" className="flex-1 p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 min-h-11 py-2 mb-1 border-l-[3px] focus-visible:outline focus-visible:outline-3 focus-visible:outline-white focus-visible:outline-offset-2 ${
                  isActive
                    ? "border-brass bg-white/[0.06] text-white"
                    : "border-transparent text-white/75 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Icon name={item.icon} className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 min-h-11 py-4 border-t border-brass/20 hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-3 focus-visible:outline-white focus-visible:outline-offset-[-2px]"
        >
          <Icon name="log-out" className="w-5 h-5 shrink-0" />
          Sign Out
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header role="banner" className="h-16 bg-white/90 border-b border-brass/30 flex items-center justify-between px-6">
          <span className="text-xs tracking-[0.14em] uppercase text-foreground-muted">Home / Dashboard</span>
          <div className="flex items-center gap-4">
            {today && <span className="text-sm text-foreground-muted hidden sm:inline">{today}</span>}
            <div
              className="w-9 h-9 rounded-full bg-primary-light text-primary font-display font-semibold flex items-center justify-center text-sm"
              aria-hidden="true"
            >
              {initialsFor(fullName)}
            </div>
            <div>
              <p className="font-medium leading-tight">{fullName}</p>
              <p className="text-sm text-foreground-muted leading-tight">{ROLES[role]}</p>
            </div>
          </div>
        </header>
        <main id="main-content" tabIndex="-1" className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
