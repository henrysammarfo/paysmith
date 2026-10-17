import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/** Only publishable / anon keys belong in the browser bundle. */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

function assertFrontendSafeKey(key: string | undefined): string {
  if (!key) {
    throw new Error("Missing VITE_SUPABASE_PUBLISHABLE_KEY");
  }
  // Never ship management or service-role credentials to the browser
  if (key.includes("service_role") || key.startsWith("sbp_") || key.startsWith("sk_")) {
    throw new Error("Refusing to load a secret/management token in the frontend");
  }
  return key;
}

if (!SUPABASE_URL?.startsWith("https://")) {
  throw new Error("VITE_SUPABASE_URL must be an https:// Supabase URL");
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  assertFrontendSafeKey(SUPABASE_PUBLISHABLE_KEY),
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
