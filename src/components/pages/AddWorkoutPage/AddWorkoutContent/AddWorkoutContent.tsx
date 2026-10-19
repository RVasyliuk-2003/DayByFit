import style from "./addWorkoutContent.module.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ExerciseInput from "./ExerciseInput/ExerciseInput";

import type {
  TimeOfDay,
  Workout,
  Exercise,
  WorkoutType,
} from "../../../../types";
import { fmtDur } from "../../../../date";
import { getType, typeColors, typeName } from "../../../../workoutTypes";
import { useWorkoutDate } from "../../../../useWorkoutDate";

type Props = {
  onAdd: (workout: Workout) => void;
  types: WorkoutType[];
  onAddType: (type: WorkoutType) => void;
  exerciseNames: string[];
};

const timesOfDay: TimeOfDay[] = ["morning", "day", "evening", "night"];

const emptyExercise = (): Exercise => ({
  name: "",
  sets: [{ weight: 0, reps: 0 }],
});

const AddWorkoutContent = ({
  onAdd,
  types,
  onAddType,
  exerciseNames,
}: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { dateKey: date } = useWorkoutDate();

  const [typeId, setTypeId] = useState("gym");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("evening");
  const [durationMin, setDurationMin] = useState(60);
  const [note, setNote] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([emptyExercise()]);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(typeColors[0]);
  const [newHasExercises, setNewHasExercises] = useState(false);

  const type = getType(types, typeId);

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
      note: note.trim() || undefined,
    };

    onAdd(workout);
    navigate(`/?date=${date}`);
  };

  return (
    <section>
      <form onSubmit={handleSubmit} className={style.form_main}>
        <span className={style.lbl}>{t("form.type")}</span>
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
              {typeName(ell)}
            </button>
          ))}
          <button
            type="button"
            className={`${style.btn_name} ${style.btn_type}`}
            onClick={() => setCreating(!creating)}
            aria-expanded={creating}
          >
            {t("form.newType")}
          </button>
        </div>
        {creating && (
          <div className={style.newType}>
            <input
              className={style.newTypeName}
              placeholder={t("form.newTypeName")}
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
                  aria-label={t("form.newTypeColor", { color: c })}
                />
              ))}
            </div>

            <label className={style.check}>
              <input
                type="checkbox"
                checked={newHasExercises}
                onChange={(e) => setNewHasExercises(e.target.checked)}
              />
              {t("form.newTypeHasExercises")}
            </label>

            <button
              type="button"
              className={style.add_btn}
              onClick={createType}
            >
              {t("form.newTypeAdd")}
            </button>
          </div>
        )}
        <span className={style.lbl}>{t("form.when")}</span>
        <div className={style.day_box}>
          {timesOfDay.map((key) => (
            <button
              type="button"
              key={key}
              className={`${style.btn_name} ${timeOfDay === key ? style.active : ""}`}
              onClick={() => setTimeOfDay(key)}
              aria-pressed={timeOfDay === key}
            >
              {t(`timeOfDay.${key}`)}
            </button>
          ))}
        </div>
        <span className={style.lbl}>{t("form.duration")}</span>
        <div className={style.time_box}>
          <button
            type="button"
            className={style.time_btn}
            aria-label={t("form.durationLess")}
            onClick={() => setDurationMin(Math.max(15, durationMin - 15))}
          >
            -
          </button>
          <output className={style.time_inpt}>{fmtDur(durationMin)}</output>
          <button
            type="button"
            className={style.time_btn}
            aria-label={t("form.durationMore")}
            onClick={() => setDurationMin(durationMin + 15)}
          >
            +
          </button>
        </div>
        {type?.hasExercises && (
          <div className={style.exercises}>
            <span className={style.lbl}>{t("form.exercises")}</span>

            {exercises.map((ex, i) => (
              <div key={i} className={style.exercise}>
                <div className={style.exHead}>
                  <ExerciseInput
                    className={style.exName}
                    placeholder={t("form.exerciseName")}
                    value={ex.name}
                    onChange={(name) => renameExercise(i, name)}
                    suggestions={exerciseNames}
                  />

                  {exercises.length > 1 && (
                    <button
                      type="button"
                      className={style.btn_close}
                      onClick={() => removeExercise(i)}
                      aria-label={t("form.removeExercise")}
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
                      placeholder={t("form.weightPlaceholder")}
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
                      placeholder={t("form.repsPlaceholder")}
                      value={s.reps || ""}
                      onChange={(e) =>
                        updateSet(i, j, "reps", Number(e.target.value))
                      }
                    />
                    <button
                      type="button"
                      className={style.iconBtn}
                      onClick={() => removeSet(i, j)}
                      aria-label={t("form.removeSet")}
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
                  {t("form.addSet")}
                </button>
              </div>
            ))}

            <button
              type="button"
              className={style.add_btn}
              onClick={addExercise}
            >
              {t("form.addExercise")}
            </button>
          </div>
        )}
        <label>
          <span className={style.lbl}>{t("form.note")}</span>
          <textarea
            className={style.note}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <button type="submit" className={style.save_btn}>
          {t("form.save")}
        </button>
      </form>
    </section>
  );
};

export default AddWorkoutContent;
