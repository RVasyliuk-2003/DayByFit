import style from "./addWorkoutContent.module.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TimeOfDay, Workout, Exercise } from "../../../../types";
import { toDateKey, fmtDur } from "../../../../date";
import { defaultTypes, getType } from "../../../../workoutTypes";

type Props = { onAdd: (workout: Workout) => void };

const timeLabels: Record<TimeOfDay, string> = {
  morning: "Ранок",
  day: "День",
  evening: "Вечір",
  night: "Ніч",
};

const emptyExercise = (): Exercise => ({
  name: "",
  sets: [{ weight: 0, reps: 0 }],
});

const AddWorkoutContent = ({ onAdd }: Props) => {
  const navigate = useNavigate();

  const [typeId, setTypeId] = useState("gym");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("evening");
  const [durationMin, setDurationMin] = useState(60);
  const [date] = useState(toDateKey(new Date()));
  const [note, setNote] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([emptyExercise()]);

  const type = getType(typeId);

  const addExercise = () => setExercises((prev) => [...prev, emptyExercise()]);

  const removeExercise = (i: number) =>
    setExercises((prev) => prev.filter((_, idx) => idx !== i));

  const renameExercise = (i: number, name: string) =>
    setExercises((prev) =>
      prev.map((ex, idx) => (idx === i ? { ...ex, name } : ex)),
    );

  const addSet = (i: number) =>
    setExercises((prev) =>
      prev.map((ex, idx) => {
        if (idx !== i) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return { ...ex, sets: [...ex.sets, { ...last }] };
      }),
    );

  const updateSet = (
    i: number,
    j: number,
    field: "weight" | "reps",
    value: number,
  ) =>
    setExercises((prev) =>
      prev.map((ex, idx) =>
        idx !== i
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, k) =>
                k === j ? { ...s, [field]: value } : s,
              ),
            },
      ),
    );

  const removeSet = (i: number, j: number) =>
    setExercises((prev) =>
      prev.map((ex, idx) =>
        idx !== i || ex.sets.length === 1
          ? ex
          : { ...ex, sets: ex.sets.filter((_, k) => k !== j) },
      ),
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleaned = exercises
      .map((ex) => ({
        name: ex.name.trim(),
        sets: ex.sets.filter((s) => s.reps > 0),
      }))
      .filter((ex) => ex.name && ex.sets.length > 0);

    const workout: Workout = {
      id: crypto.randomUUID(),
      date,
      timeOfDay,
      durationMin,
      typeId,
      exercises: type?.hasExercises ? cleaned : undefined,
      note: type?.hasExercises ? undefined : note,
    };

    onAdd(workout);
    navigate("/");
  };

  return (
    <section>
      <form onSubmit={handleSubmit} className={style.form_main}>
        <span className={style.lbl}>Що тренував</span>
        <div className={style.flexWrap}>
          {defaultTypes.map((ell) => (
            <button
              type="button"
              key={ell.id}
              className={`${style.btn_name} ${typeId === ell.id ? style.active : ""}`}
              onClick={() => setTypeId(ell.id)}
              aria-pressed={typeId === ell.id}
            >
              {ell.name}
            </button>
          ))}
        </div>

        <span className={style.lbl}>Коли</span>
        <div className={style.day_box}>
          {(Object.keys(timeLabels) as TimeOfDay[]).map((key) => (
            <button
              type="button"
              key={key}
              className={`${style.btn_name} ${timeOfDay === key ? style.active : ""}`}
              onClick={() => setTimeOfDay(key)}
              aria-pressed={timeOfDay === key}
            >
              {timeLabels[key]}
            </button>
          ))}
        </div>

        <span className={style.lbl}>Скільки тривало</span>
        <div className={style.time_box}>
          <button
            type="button"
            className={style.time_btn}
            onClick={() => setDurationMin(Math.max(15, durationMin - 15))}
          >
            -
          </button>
          <output className={style.time_inpt}>{fmtDur(durationMin)}</output>
          <button
            type="button"
            className={style.time_btn}
            onClick={() => setDurationMin(durationMin + 15)}
          >
            +
          </button>
        </div>

        {type?.hasExercises ? (
          <div className={style.exercises}>
            <span className={style.lbl}>Вправи</span>

            {exercises.map((ex, i) => (
              <div key={i} className={style.exercise}>
                <div className={style.exHead}>
                  <div className={style.name_inpt_box}>
                    <input
                      className={style.exName}
                      placeholder="Назва вправи"
                      value={ex.name}
                      onChange={(e) => renameExercise(i, e.target.value)}
                    />
                    <button type="button" className={style.btn_close}>
                      ×
                    </button>
                  </div>

                  {exercises.length > 1 && (
                    <button
                      type="button"
                      className={style.iconBtn}
                      onClick={() => removeExercise(i)}
                      aria-label="Видалити вправу"
                    >
                      ×
                    </button>
                  )}
                </div>

                {ex.sets.map((s, j) => (
                  <div key={j} className={style.setRow}>
                    <span className={style.setNum}>{j + 1}</span>
                    <input
                      className={style.inpt_set}
                      type="number"
                      inputMode="decimal"
                      placeholder="кг"
                      value={s.weight || ""}
                      onChange={(e) =>
                        updateSet(i, j, "weight", Number(e.target.value))
                      }
                    />
                    <span className={style.x_span}>×</span>
                    <input
                      className={style.inpt_set}
                      type="number"
                      inputMode="numeric"
                      placeholder="повт."
                      value={s.reps || ""}
                      onChange={(e) =>
                        updateSet(i, j, "reps", Number(e.target.value))
                      }
                    />
                    <button
                      type="button"
                      className={style.iconBtn}
                      onClick={() => removeSet(i, j)}
                      aria-label="Видалити підхід"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className={style.add_btn}
                  onClick={() => addSet(i)}
                >
                  Додати підхід
                </button>
              </div>
            ))}

            <button
              type="button"
              className={style.add_btn}
              onClick={addExercise}
            >
              Додати вправу
            </button>
          </div>
        ) : (
          <label>
            <span className={style.lbl}>Нотатка</span>
            <textarea
              className={style.note}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        )}

        <button type="submit" className={style.save_btn}>
          Зберегти тренування
        </button>
      </form>
    </section>
  );
};

export default AddWorkoutContent;
