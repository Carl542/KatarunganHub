import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function createClient(options = {}) {
  return createBrowserClient(supabaseUrl, supabaseKey, {
    // Unchecked "Remember me" → session cookie (cleared when the browser closes)
    // instead of the library's 400-day default.
    cookieOptions: options.rememberMe === false ? { maxAge: undefined } : undefined,
  });
}
