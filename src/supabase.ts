import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;

if (!url || !key) {
  throw new Error("Немає VITE_SUPABASE_URL або VITE_SUPABASE_KEY у .env.local");
}

const fetchWithTimeout: typeof fetch = (input, init) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  init?.signal?.addEventListener("abort", () => ctrl.abort());
  return fetch(input, { ...init, signal: ctrl.signal }).finally(() =>
    clearTimeout(timer),
  );
};

export const supabase = createClient(url, key, {
  global: { fetch: fetchWithTimeout },
});