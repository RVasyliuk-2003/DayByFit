import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

type AuthValue = { user: User | null; loading: boolean };

export const AuthContext = createContext<AuthValue>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);
