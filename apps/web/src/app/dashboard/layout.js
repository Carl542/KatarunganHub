import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";

async function getBarangayName() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/public`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.barangay_name || null;
  } catch {
    return null;
  }
}

export default async function DashboardLayout({ children }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const barangayName = await getBarangayName();

  return (
    <DashboardShell role={profile.role} fullName={profile.full_name} barangayName={barangayName}>
      {children}
    </DashboardShell>
  );
}
