import { getCurrentProfile } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import AdminOverview from "./AdminOverview";
import CaseOverview from "./CaseOverview";
import CitizenOverview from "./CitizenOverview";

const CASE_STAFF_ROLES = ["punong", "secretary", "lupon"];
const CITIZEN_ROLES = ["complainant", "respondent"];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const isCaseStaff = CASE_STAFF_ROLES.includes(profile.role);
  const isCitizen = CITIZEN_ROLES.includes(profile.role);

  return (
    <>
      {!isCitizen && (
        <>
          <h1 className="font-display text-2xl font-semibold mb-1">
            {profile.role === "admin" ? "System Administration" : `${greeting()}, ${profile.full_name}!`}
          </h1>
          <p className="text-foreground-muted mb-6">
            {profile.role === "admin"
              ? "Manage accounts, Lupon profiles, and review recent system activity."
              : isCaseStaff
              ? "Here's what's happening across Katarungang Pambarangay cases."
              : `You are signed in as ${ROLES[profile.role] || profile.role}.`}
          </p>
        </>
      )}

      {profile.role === "admin" && <AdminOverview />}
      {isCaseStaff && <CaseOverview />}
      {isCitizen && <CitizenOverview />}
    </>
  );
}
