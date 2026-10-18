import style from "./syncStatus.module.css";

import { useTranslation } from "react-i18next";

type Props = {
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onDismiss: () => void;
};

const SyncStatus = ({ loading, error, onRetry, onDismiss }: Props) => {
  const { t } = useTranslation();

  if (error) {
    return (
      <div className={`${style.bar} ${style.error}`} role="alert">
        <span>{t("sync.error")}</span>
        <button type="button" onClick={onRetry}>
          {t("sync.retry")}
        </button>
        <button type="button" onClick={onDismiss} aria-label={t("sync.close")}>
          ×
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={style.bar} role="status">
        {t("sync.loading")}
      </div>
    );
  }

  return null;
};

export default SyncStatus;
