import style from "./typesPage.module.css";

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { Workout, WorkoutType } from "../../../types";
import { defaultTypes, typeName } from "../../../workoutTypes";

type Props = {
  types: WorkoutType[];
  workouts: Workout[];
  onRemove: (id: string) => void;
};

const TypesPage = ({ types, workouts, onRemove }: Props) => {
  const { t } = useTranslation();

  const usage = (id: string) => workouts.filter((w) => w.typeId === id).length;
  const isDefault = (id: string) => defaultTypes.some((d) => d.id === id);

  const remove = (type: WorkoutType) => {
    const used = usage(type.id);
    if (used > 0) {
      window.alert(t("typesPage.inUse", { count: used }));
      return;
    }
    if (
      window.confirm(t("typesPage.deleteConfirm", { name: typeName(type) }))
    ) {
      onRemove(type.id);
    }
  };

  return (
    <section className={style.wrap}>
      <h1 className={style.h1}>{t("typesPage.title")}</h1>

      <div className={style.list}>
        {types.map((type) => (
          <div key={type.id} className={style.row}>
            <span className={style.dot} style={{ background: type.color }} />
            <span className={style.info}>
              <strong>{typeName(type)}</strong>
              <small>
                {isDefault(type.id)
                  ? t("typesPage.base")
                  : t("typesPage.used", { count: usage(type.id) })}
              </small>
            </span>

            {!isDefault(type.id) && (
              <button
                type="button"
                className={style.del}
                onClick={() => remove(type)}
                aria-label={t("typesPage.deleteAria")}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <Link to="/add" className={style.back}>
        {t("typesPage.back")}
      </Link>
    </section>
  );
};

export default TypesPage;
