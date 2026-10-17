import style from "./exercisesContent.module.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Workout } from "../../../../types";
import { getExerciseSummaries } from "../../../../progress";
import { fmtSet } from "../../../../format";
import { shortDate } from "../../../../summary";

type Props = { workouts: Workout[] };

const ExircisesContent = ({ workouts }: Props) => {
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
            placeholder="Знайти вправу"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Пошук вправи"
          />
        )}

        {items.length > 0 ? (
          <>
            <h2 className={style.h2}>
              Усі вправи <small>{items.length}</small>
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
                      Востаннє {shortDate(e.lastDate)}:{" "}
                      {fmtSet(e.topWeight, e.topReps)}, {e.sets}п
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
            {all.length === 0
              ? "Поки немає вправ. Запиши тренування із залу, і вони з'являться тут."
              : "Такої вправи немає. Додай її в новому тренуванні, і вона з'явиться тут."}
          </p>
        )}
      </div>
    </section>
  );
};

export default ExircisesContent;
