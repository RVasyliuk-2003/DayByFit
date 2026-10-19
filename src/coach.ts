import { FunctionsHttpError } from "@supabase/supabase-js";
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
    .limit(50);
  if (error) throw error;
  return (data as CoachMessage[]).reverse();
};

export const askCoach = async (message: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke("coach", {
    body: { message },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null);
      if (body?.error === "limit") throw new CoachLimitError();
    }
    throw error;
  }

  return data.reply as string;
};