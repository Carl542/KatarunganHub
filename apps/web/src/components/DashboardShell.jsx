"use client";

import Link from "next/link";
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

export default function DashboardShell({ role, fullName, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = NAV_BY_ROLE[role] || [];

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
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <BrandMark size={40} />
          <span className="font-bold">KatarunganHub</span>
        </div>
        <nav aria-label="Primary" className="flex-1 p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 min-h-11 py-2 rounded-md mb-1 focus-visible:outline focus-visible:outline-3 focus-visible:outline-white focus-visible:outline-offset-2 ${
                  isActive ? "bg-primary" : "hover:bg-white/10"
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
          className="flex items-center gap-3 px-3 min-h-11 py-4 border-t border-white/10 hover:bg-white/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-white focus-visible:outline-offset-[-2px]"
        >
          <Icon name="log-out" className="w-5 h-5 shrink-0" />
          Sign Out
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header role="banner" className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
          <span className="text-sm text-foreground-muted">Home / Dashboard</span>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full bg-primary-light text-primary font-bold flex items-center justify-center text-sm"
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
        <main id="main-content" tabIndex="-1" className="flex-1 p-6 bg-primary-light/40">
          {children}
        </main>
      </div>
    </div>
  );
}
