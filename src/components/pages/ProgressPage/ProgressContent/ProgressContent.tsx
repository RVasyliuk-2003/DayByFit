import style from "./progressContent.module.css";

import { useState } from "react";
import type { Workout } from "../../../../types";
import { toDateKey } from "../../../../date";
import { getExerciseHistory, type ExercisePoint } from "../../../../progress";
import LineChart from "./LineChart/LineChart";

type Props = { workouts: Workout[]; exercise: string };

const PERIODS = [
  { months: 3, label: "3 місяці" },
  { months: 6, label: "6 місяців" },
  { months: 12, label: "Рік" },
];

const shortDate = (date: string) => {
  const [, m, d] = date.split("-");
  return `${d}.${m}`;
};

const ProgressContent = ({ workouts, exercise }: Props) => {
  const [metric, setMetric] = useState<"main" | "sets">("main");
  const [months, setMonths] = useState(6);

  if (!exercise) {
    return (
      <p className={style.empty}>
        Поки немає вправ. Запиши тренування із залу, і тут з'явиться прогрес.
      </p>
    );
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

  const mainUnit = bodyweight ? "повт." : "кг";
  const unit = metric === "sets" ? "підх." : mainUnit;

  const values = points.map(value);
  const labels = points.map((p) => shortDate(p.date));
  const end = values[values.length - 1];
  const delta = values.length > 1 ? end - values[0] : 0;
  const periodLabel = PERIODS.find((p) => p.months === months)?.label;

  return (
    <div className={style.wrap}>
      <div className={style.seg} role="group" aria-label="Що показувати">
        <button
          type="button"
          aria-pressed={metric === "main"}
          onClick={() => setMetric("main")}
        >
          {bodyweight ? "Повтори" : "Вага"}
        </button>
        <button
          type="button"
          aria-pressed={metric === "sets"}
          onClick={() => setMetric("sets")}
        >
          Підходи
        </button>
      </div>

      <div className={style.card}>
        {values.length === 0 && (
          <h2 className={style.h2}>За цей період записів немає</h2>
        )}

        {values.length === 1 && (
          <>
            <h2 className={style.h2}>
              Зараз {end} {unit}
            </h2>
            <p className={style.sub}>Один запис за цей період</p>
            <p className={style.hint}>
              Графік з'явиться, коли буде хоча б два тренування з цією вправою.
            </p>
          </>
        )}

        {values.length > 1 && (
          <>
            <h2 className={style.h2}>
              З {values[0]} до {end} {unit}
            </h2>
            <p className={style.sub}>
              {delta === 0 ? (
                `Без змін за ${periodLabel}`
              ) : (
                <>
                  <strong>
                    {delta > 0 ? "+" : "−"}
                    {Math.abs(delta)} {unit}
                  </strong>{" "}
                  за {periodLabel}
                </>
              )}
            </p>
            <LineChart values={values} labels={labels} />
          </>
        )}
      </div>

      <div className={style.seg} role="group" aria-label="Період">
        {PERIODS.map((p) => (
          <button
            type="button"
            key={p.months}
            aria-pressed={months === p.months}
            onClick={() => setMonths(p.months)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className={style.facts}>
        <div>
          <span>{bodyweight ? "Найбільше повторів" : "Найбільша вага"}</span>
          <b>
            {Math.max(...all.map(mainValue))} {mainUnit}
          </b>
        </div>
        <div>
          <span>Найбільше підходів</span>
          <b>{Math.max(...all.map((p) => p.sets))}</b>
        </div>
        <div>
          <span>Тренувань з цією вправою</span>
          <b>{all.length}</b>
        </div>
      </div>
    </div>
  );
};

export default ProgressContent;
