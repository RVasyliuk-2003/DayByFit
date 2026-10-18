import style from "./progressContent.module.css";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Workout } from "../../../../types";
import { toDateKey, shortDate } from "../../../../date";
import { getExerciseHistory, type ExercisePoint } from "../../../../progress";
import LineChart from "./LineChart/LineChart";

type Props = { workouts: Workout[]; exercise: string };

const PERIODS = [
  { months: 3, key: "months3" },
  { months: 6, key: "months6" },
  { months: 12, key: "months12" },
] as const;

const ProgressContent = ({ workouts, exercise }: Props) => {
  const { t } = useTranslation();
  const [metric, setMetric] = useState<"main" | "sets">("main");
  const [months, setMonths] = useState(6);

  if (!exercise) {
    return <p className={style.empty}>{t("progress.empty")}</p>;
  }

  const { points: all, bodyweight } = getExerciseHistory(workouts, exercise);

  const now = new Date();
  const cutoff = toDateKey(
    new Date(now.getFullYear(), now.getMonth() - months, now.getDate()),
  );
  const points = all.filter((p) => p.date >= cutoff);

  const mainValue = (p: ExercisePoint) =>
    bodyweight ? p.topReps : p.topWeight;
  const value = (p: ExercisePoint) =>
    metric === "main" ? mainValue(p) : p.sets;

  const mainUnit = t(bodyweight ? "progress.unitReps" : "progress.unitKg");
  const unit = metric === "sets" ? t("progress.unitSets") : mainUnit;

  const values = points.map(value);
  const labels = points.map((p) => shortDate(p.date));
  const end = values[values.length - 1];
  const delta = values.length > 1 ? end - values[0] : 0;

  const periodKey = PERIODS.find((p) => p.months === months)?.key ?? "months6";
  const periodLabel = t(`progress.${periodKey}`).toLowerCase();

  return (
    <section style={{ padding: "20px 20px 24px" }}>
      <div className={style.wrap}>
        <div
          className={style.seg}
          role="group"
          aria-label={t("progress.metric")}
        >
          <button
            type="button"
            aria-pressed={metric === "main"}
            onClick={() => setMetric("main")}
          >
            {t(bodyweight ? "progress.reps" : "progress.weight")}
          </button>
          <button
            type="button"
            aria-pressed={metric === "sets"}
            onClick={() => setMetric("sets")}
          >
            {t("progress.sets")}
          </button>
        </div>

        <div className={style.card}>
          {values.length === 0 && (
            <h2 className={style.h2}>{t("progress.noRecords")}</h2>
          )}

          {values.length === 1 && (
            <>
              <h2 className={style.h2}>
                {t("progress.now", { value: end, unit })}
              </h2>
              <p className={style.sub}>{t("progress.oneRecord")}</p>
              <p className={style.hint}>{t("progress.needTwo")}</p>
            </>
          )}

          {values.length > 1 && (
            <>
              <h2 className={style.h2}>
                {t("progress.fromTo", { from: values[0], to: end, unit })}
              </h2>
              <p className={style.sub}>
                {delta === 0 ? (
                  t("progress.noChange", { period: periodLabel })
                ) : (
                  <>
                    <strong>
                      {delta > 0 ? "+" : "−"}
                      {Math.abs(delta)} {unit}
                    </strong>{" "}
                    {t("progress.change", { period: periodLabel })}
                  </>
                )}
              </p>
              <LineChart values={values} labels={labels} />
            </>
          )}
        </div>

        <div
          className={style.seg}
          role="group"
          aria-label={t("progress.period")}
        >
          {PERIODS.map((p) => (
            <button
              type="button"
              key={p.months}
              aria-pressed={months === p.months}
              onClick={() => setMonths(p.months)}
            >
              {t(`progress.${p.key}`)}
            </button>
          ))}
        </div>

        <div className={style.facts}>
          <div>
            <span>
              {t(bodyweight ? "progress.maxReps" : "progress.maxWeight")}
            </span>
            <b>
              {Math.max(...all.map(mainValue))} {mainUnit}
            </b>
          </div>
          <div>
            <span>{t("progress.maxSets")}</span>
            <b>{Math.max(...all.map((p) => p.sets))}</b>
          </div>
          <div>
            <span>{t("progress.total")}</span>
            <b>{all.length}</b>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgressContent;
