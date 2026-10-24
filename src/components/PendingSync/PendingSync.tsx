import style from "./pendingSync.module.css";
import { useTranslation } from "react-i18next";

type Props = { count: number; onRetry: () => void };

const PendingSync = ({ count, onRetry }: Props) => {
  const { t } = useTranslation();
  if (count === 0) return null;

  return (
    <div className={style.bar} role="status">
      <span>{t("pendingSync.text", { count })}</span>
      <button type="button" className={style.btn} onClick={onRetry}>
        {t("pendingSync.retry")}
      </button>
    </div>
  );
};

export default PendingSync;
