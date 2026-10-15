import style from "./addWorkoutContent.module.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  TimeOfDay,
  Workout,
  Exercise,
  WorkoutType,
} from "../../../../types";
import { toDateKey, fmtDur } from "../../../../date";

import { getType, typeColors } from "../../../../workoutTypes";

type Props = {
  onAdd: (workout: Workout) => void;
  types: WorkoutType[];
  onAddType: (type: WorkoutType) => void;
};

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

const AddWorkoutContent = ({ onAdd, types, onAddType }: Props) => {
  const navigate = useNavigate();

  const [typeId, setTypeId] = useState("gym");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("evening");
  const [durationMin, setDurationMin] = useState(60);
  const [date] = useState(toDateKey(new Date()));
  const [note, setNote] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([emptyExercise()]);

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

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(typeColors[0]);
  const [newHasExercises, setNewHasExercises] = useState(false);

  const type = getType(types, typeId);

  const createType = () => {
    const name = newName.trim();
    if (!name) return;

    const created: WorkoutType = {
      id: crypto.randomUUID(),
      name,
      color: newColor,
      hasExercises: newHasExercises,
    };

    onAddType(created);
    setTypeId(created.id);
    setCreating(false);
    setNewName("");
    setNewHasExercises(false);
  };

  return (
    <section>
      <form onSubmit={handleSubmit} className={style.form_main}>
        <span className={style.lbl}>Що тренував</span>
        <div className={style.flexWrap}>
          {types.map((ell) => (
            <button
              type="button"
              key={ell.id}
              className={style.typeBtn}
              style={{ "--c": ell.color } as React.CSSProperties}
              onClick={() => setTypeId(ell.id)}
              aria-pressed={typeId === ell.id}
            >
              {ell.name}
            </button>
          ))}
          <button
            type="button"
            className={`${style.btn_name} ${style.btn_type}`}
            onClick={() => setCreating(!creating)}
            aria-expanded={creating}
          >
            + Свій тип
          </button>
        </div>

        {creating && (
          <div className={style.newType}>
            <input
              className={style.newTypeName}
              placeholder="Назва (напр. Біг)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // інакше Enter збереже все тренування
                  createType();
                }
              }}
            />

            <div className={style.swatches}>
              {typeColors.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`${style.swatch} ${newColor === c ? style.swatchActive : ""}`}
                  style={{ background: c }}
                  onClick={() => setNewColor(c)}
                  aria-pressed={newColor === c}
                  aria-label={`Колір ${c}`}
                />
              ))}
            </div>

            <label className={style.check}>
              <input
                type="checkbox"
                checked={newHasExercises}
                onChange={(e) => setNewHasExercises(e.target.checked)}
              />
              Записувати вправи й підходи
            </label>

            <button
              type="button"
              className={style.add_btn}
              onClick={createType}
            >
              Додати тип
            </button>
          </div>
        )}

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
                  <input
                    className={style.exName}
                    placeholder="Назва вправи"
                    value={ex.name}
                    onChange={(e) => renameExercise(i, e.target.value)}
                  />

                  {exercises.length > 1 && (
                    <button
                      type="button"
                      className={style.btn_close}
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
