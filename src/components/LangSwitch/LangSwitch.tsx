import style from "./langSwitch.module.css";

import { useTranslation } from "react-i18next";

const LANGS = ["uk", "en"] as const;

const LangSwitch = () => {
  const { i18n } = useTranslation();

  return (
    <div className={style.bar} role="group" aria-label="Language">
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
