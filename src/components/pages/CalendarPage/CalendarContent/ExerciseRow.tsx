import { useState } from "react";
import style from "./calendarContent.module.css";
import type { Exercise } from "../../../../types";

type Props = { exercise: Exercise };

const fmtSet = (weight: number, reps: number) =>
  weight > 0 ? `${weight} кг × ${reps}` : `${reps} повт.`;

const ExerciseRow = ({ exercise }: Props) => {
  const [open, setOpen] = useState(false);

  const maxWeight = Math.max(...exercise.sets.map((s) => s.weight));
  const top = exercise.sets.reduce((best, s) =>
    s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps)
      ? s
      : best,
  );

  return (
    <div className={`${style.ex} ${open ? style.open : ""}`}>
      <button
        type="button"
        className={style.exBtn}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className={style.nm}>{exercise.name}</span>
        <span className={style.val}>{fmtSet(top.weight, top.reps)}</span>
        <span className={style.chip}>{exercise.sets.length}п</span>
        <span className={style.chev}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      <div className={style.sets}>
        <div>
          {exercise.sets.map((s, i) => (
            <div key={i} className={style.set}>
              <span>{i + 1}</span>
              <i
                style={
                  {
                    "--w": `${maxWeight > 0 ? (s.weight / maxWeight) * 100 : 100}%`,
                  } as React.CSSProperties
                }
              />
              <b>{fmtSet(s.weight, s.reps)}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExerciseRow;
