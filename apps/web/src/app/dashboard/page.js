import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <DashboardShell role={profile.role} fullName={profile.full_name}>
      <h1 className="text-2xl font-bold mb-2">Welcome, {profile.full_name}</h1>
      <p className="text-gray-600">
        You are signed in as {profile.role}. Case management modules arrive in later milestones.
      </p>
    </DashboardShell>
  );
}
