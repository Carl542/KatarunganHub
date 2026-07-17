import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const DEMO_USERS = [
  { email: "admin@demo.katarunganhub.local", role: "admin", full_name: "Juan Dela Cruz" },
  { email: "punong@demo.katarunganhub.local", role: "punong", full_name: "Hon. Roberto Lim" },
  { email: "secretary@demo.katarunganhub.local", role: "secretary", full_name: "Ana Reyes" },
  { email: "lupon@demo.katarunganhub.local", role: "lupon", full_name: "Elena Cruz" },
  { email: "complainant@demo.katarunganhub.local", role: "complainant", full_name: "Maria Santos" },
  { email: "respondent@demo.katarunganhub.local", role: "respondent", full_name: "Roberto Santos" },
];

for (const demo of DEMO_USERS) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: demo.email,
    password: "DemoPass123!",
    email_confirm: true,
  });
  if (error) {
    console.error(`Failed to create ${demo.email}:`, error.message);
    continue;
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    full_name: demo.full_name,
    role: demo.role,
  });
  if (profileError) {
    console.error(`Failed to insert profile for ${demo.email}:`, profileError.message);
    continue;
  }

  console.log(`Seeded ${demo.email} (${demo.role})`);
}
