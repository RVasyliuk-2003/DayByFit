import style from "./exercisesContent.module.css";

import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { Workout } from "../../../../types";
import { getExerciseSummaries } from "../../../../progress";
import { fmtSet } from "../../../../format";
import { shortDate } from "../../../../date";

type Props = { workouts: Workout[] };

const ExercisesContent = ({ workouts }: Props) => {
  const { t } = useTranslation();
  const [q, setQ] = useState("");

  const all = getExerciseSummaries(workouts);
  const query = q.trim().toLowerCase();
  const items = all.filter((e) => e.name.toLowerCase().includes(query));

  return (
    <section style={{ padding: "20px 20px 24px" }}>
      <div className={style.wrap}>
        {all.length > 0 && (
          <input
            type="search"
            className={style.search}
            placeholder={t("exercises.search")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label={t("exercises.searchLabel")}
          />
        )}

        {items.length > 0 ? (
          <>
            <h2 className={style.h2}>
              {t("exercises.all")} <small>{items.length}</small>
            </h2>
            <div className={style.list}>
              {items.map((e) => (
                <Link
                  key={e.name}
                  to={`/progress?exercise=${encodeURIComponent(e.name)}`}
                  className={style.row}
                >
                  <span>
                    <strong>{e.name}</strong>
                    <small>
                      {t("exercises.last", {
                        date: shortDate(e.lastDate),
                        set: fmtSet(e.topWeight, e.topReps),
                        n: e.sets,
                      })}
                    </small>
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className={style.chev}
                  >
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <p className={style.empty}>
            {all.length === 0 ? t("exercises.empty") : t("exercises.notFound")}
          </p>
        )}
      </div>
    </section>
  );
};

export default ExercisesContent;
