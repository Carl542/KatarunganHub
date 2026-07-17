import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";

export default async function DashboardLayout({ children }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <DashboardShell role={profile.role} fullName={profile.full_name}>
      {children}
    </DashboardShell>
  );
}
