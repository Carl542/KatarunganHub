"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Icon from "./Icon";
import BrandMark from "./BrandMark";
import { ROLES, NAV_BY_ROLE } from "@/lib/roles";

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
      <aside className="w-64 bg-foreground text-white flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <BrandMark size={40} />
          <span className="font-bold">KatarunganHub</span>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md mb-1 ${
                pathname === item.path ? "bg-primary" : "hover:bg-white/10"
              }`}
            >
              <Icon name={item.icon} className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-4 border-t border-white/10 hover:bg-white/10"
        >
          <Icon name="log-out" className="w-5 h-5" />
          Sign Out
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <span className="text-sm text-gray-500">Home / Dashboard</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{fullName}</span>
            <span className="text-sm text-gray-500">{ROLES[role]}</span>
          </div>
        </header>
        <main className="flex-1 p-6 bg-primary-light/40">{children}</main>
      </div>
    </div>
  );
}
