import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const BUCKET = "case-documents";

const { data: existing } = await supabase.storage.getBucket(BUCKET);

if (existing) {
  console.log(`Bucket "${BUCKET}" already exists.`);
} else {
  const { error } = await supabase.storage.createBucket(BUCKET, { public: false });
  if (error) {
    console.error(`Failed to create bucket "${BUCKET}":`, error.message);
    process.exit(1);
  }
  console.log(`Created private bucket "${BUCKET}".`);
}
