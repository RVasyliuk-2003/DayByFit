import style from "./accountContent.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { supabase } from "../../../supabase";
import { useAuth } from "../../../auth/authContext";

const AccountContent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");

    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else navigate("/");
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else if (!data.session)
        setInfo(t("account.checkEmail")); // потрібне підтвердження пошти
      else navigate("/");
    }

    setBusy(false);
  };

  if (loading) return null;

  return (
    <section style={{ padding: "20px 20px 24px" }}>
      {user ? (
        <div className={style.box}>
          <p className={style.text}>
            {t("account.signedAs")} <strong>{user.email}</strong>
          </p>
          <button
            type="button"
            className={style.ghost}
            onClick={() => supabase.auth.signOut()}
          >
            {t("account.signOut")}
          </button>
        </div>
      ) : (
        <form className={style.box} onSubmit={handleSubmit}>
          <input
            className={style.input}
            type="email"
            autoComplete="email"
            placeholder={t("account.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={style.input}
            type="password"
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            placeholder={t("account.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <button type="submit" className={style.primary} disabled={busy}>
            {busy
              ? t("account.working")
              : t(mode === "in" ? "account.signIn" : "account.signUp")}
          </button>

          {error && (
            <p className={style.error} role="alert">
              {error}
            </p>
          )}
          {info && (
            <p className={style.text} role="status">
              {info}
            </p>
          )}

          <button
            type="button"
            className={style.link}
            onClick={() => {
              setMode(mode === "in" ? "up" : "in");
              setError("");
              setInfo("");
            }}
          >
            {t(mode === "in" ? "account.toSignUp" : "account.toSignIn")}
          </button>
        </form>
      )}
    </section>
  );
};

export default AccountContent;
