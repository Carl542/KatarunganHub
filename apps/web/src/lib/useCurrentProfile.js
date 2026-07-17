"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function useCurrentProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("id, full_name, role").eq("id", user.id).single();
      setProfile(data);
    });
  }, []);

  return profile;
}
