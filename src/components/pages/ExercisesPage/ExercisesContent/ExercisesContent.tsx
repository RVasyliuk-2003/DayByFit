import style from "./exercisesContent.module.css";

import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { Workout } from "../../../../types";
import { getExerciseSummaries } from "../../../../progress";
import { fmtSet } from "../../../../format";
import { shortDate } from "../../../../date";

import {
  renameExercise,
  withoutExercise,
  workoutsWithExercise,
} from "../../../../exerciseEdit";

type Props = { workouts: Workout[]; onUpdate: (w: Workout) => void };

const ExercisesContent = ({ workouts, onUpdate }: Props) => {
  const { t } = useTranslation();
  const [q, setQ] = useState("");

  const rename = (name: string) => {
    const next = window.prompt(t("exercises.renamePrompt"), name)?.trim();
    if (!next || next === name) return;
    workoutsWithExercise(workouts, name).forEach((w) =>
      onUpdate(renameExercise(w, name, next)),
    );
  };

  const remove = (name: string) => {
    const hit = workoutsWithExercise(workouts, name);
    if (
      !window.confirm(t("exercises.deleteConfirm", { name, count: hit.length }))
    )
      return;
    hit.forEach((w) => onUpdate(withoutExercise(w, name)));
  };

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
                <div key={e.name} className={style.row}>
                  <Link
                    to={`/progress?exercise=${encodeURIComponent(e.name)}`}
                    className={style.main}
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

                  <div className={style.actions}>
                    <button
                      type="button"
                      className={style.act}
                      onClick={() => rename(e.name)}
                      aria-label={t("exercises.renameAria")}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={style.act}
                      onClick={() => remove(e.name)}
                      aria-label={t("exercises.deleteAria")}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </div>
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
