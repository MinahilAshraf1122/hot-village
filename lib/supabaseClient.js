import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Build-safe fallbacks so `next build` never crashes when env vars are
// missing locally. Real values come from .env.local / hosting env vars.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key"
);

export const isSupabaseConfigured = Boolean(url && anonKey);
