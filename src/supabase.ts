import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;

if (!url || !key) {
  throw new Error("Немає VITE_SUPABASE_URL або VITE_SUPABASE_KEY у .env.local");
}

export const supabase = createClient(url, key);
