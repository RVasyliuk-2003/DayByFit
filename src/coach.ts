import { supabase } from "./supabase";

export type CoachMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export class CoachLimitError extends Error {}

// останні повідомлення чату (читаємо напряму: правила бази віддають лише твої)
export const fetchCoachHistory = async (): Promise<CoachMessage[]> => {
  const { data, error } = await supabase
    .from("coach_messages")
    .select("id, role, content")
    .order("created_at", { ascending: false })
    .limit(50)
    .select("id, role, content")
    .eq("hidden", false)
    .order("created_at", { ascending: false });
    
  if (error) throw error;
  return (data as CoachMessage[]).reverse();
};

// onText отримує весь накопичений текст щоразу, як приходить нова частина
export const askCoach = async (
  message: string,
  onText: (text: string) => void,
): Promise<string> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("no session");

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_KEY,
      },
      body: JSON.stringify({ message }),
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    if (body?.error === "limit") throw new CoachLimitError();
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  if (!res.body) throw new Error("no stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    onText(full);
  }

  if (!full.trim()) throw new Error("empty reply");
  return full.trim();
};

export const clearCoach = async (forget: boolean): Promise<void> => {
  const { error } = await supabase.functions.invoke("coach", {
    body: { action: "clear", forget },
  });
  if (error) throw error;
};

export const fetchAbout = async (): Promise<string> => {
  const { data, error } = await supabase
    .from("coach_profile")
    .select("about")
    .maybeSingle();
  if (error) throw error;
  return data?.about ?? "";
};

export const saveAbout = async (userId: string, about: string) => {
  const { error } = await supabase.from("coach_profile").upsert({
    user_id: userId,
    about,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
};