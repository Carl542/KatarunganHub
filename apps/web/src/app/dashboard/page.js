import { getCurrentProfile } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import AdminOverview from "./AdminOverview";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  return (
    <>
      <h1 className="font-display text-2xl font-semibold mb-1">
        {profile.role === "admin" ? "System Administration" : `Welcome, ${profile.full_name}`}
      </h1>
      <p className="text-foreground-muted mb-6">
        {profile.role === "admin"
          ? "Manage accounts, Lupon profiles, and review recent system activity."
          : `You are signed in as ${ROLES[profile.role] || profile.role}.`}
      </p>

      {profile.role === "admin" && <AdminOverview />}
    </>
  );
}
