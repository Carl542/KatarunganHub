import { getCurrentProfile } from "@/lib/auth";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Welcome, {profile.full_name}</h1>
      <p className="text-gray-600">
        You are signed in as {profile.role}. Case management modules arrive in later milestones.
      </p>
    </>
  );
}
