import style from "./progressHeader.module.css";

import { useTranslation } from "react-i18next";

type Props = {
  names: string[];
  value: string;
  onChange: (name: string) => void;
};

const ProgressHeader = ({ names, value, onChange }: Props) => {
  const { t } = useTranslation();

  return (
    <header className="top">
      <h1 className="h1">{t("progress.title")}</h1>
      <p className="p">{t("progress.subtitle")}</p>
      {names.length > 0 && (
        <select
          className={style.sel}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={t("progress.exercise")}
        >
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      )}
    </header>
  );
};

export default ProgressHeader;
