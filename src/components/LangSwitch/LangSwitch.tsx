import style from "./langSwitch.module.css";

import { Link } from "react-router-dom";
import { useAuth } from "../../auth/authContext";
import { useTranslation } from "react-i18next";

const LANGS = ["uk", "en"] as const;

const LangSwitch = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  return (
    <div className={style.bar} role="group" aria-label="Language">
      <Link to="/account" className={style.account}>
        {user ? t("account.link") : t("account.signInLink")}
      </Link>
      {LANGS.map((lng) => (
        <button
          type="button"
          key={lng}
          className={style.btn}
          aria-pressed={i18n.resolvedLanguage === lng}
          onClick={() => i18n.changeLanguage(lng)}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LangSwitch;
