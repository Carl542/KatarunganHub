import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from("complaints")
    .update({ status: "Settlement monitoring" })
    .or("workflow_stage.eq.Settlement monitoring,workflow_stage.eq.Settlement Monitoring")
    .select();

  if (error) {
    console.error("Error updating complaints status:", error);
  } else {
    console.log("Successfully updated complaints status:", data?.length, "records updated.");
  }
}

run();
