import style from "./addWorkoutContent.module.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TimeOfDay, Workout } from "../../../../types";
import { toDateKey, fmtDur } from "../../../../date";
import { defaultTypes, getType } from "../../../../workoutTypes";

type Props = { onAdd: (workout: Workout) => void };

const timeLabels: Record<TimeOfDay, string> = {
  morning: "Ранок",
  day: "День",
  evening: "Вечір",
  night: "Ніч",
};

const AddWorkoutContent = ({ onAdd }: Props) => {
  const navigate = useNavigate();

  const [typeId, setTypeId] = useState("gym");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("evening");
  const [durationMin, setDurationMin] = useState(60);
  const [date] = useState(toDateKey(new Date()));
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const workout: Workout = {
      id: crypto.randomUUID(),
      date,
      timeOfDay,
      durationMin,
      typeId,
      note: type?.hasExercises ? undefined : note,
    };

    onAdd(workout);
    navigate("/"); // повертаємось у календар

   
  };

  const type = getType(typeId);

  return (
    <section>
      <form onSubmit={handleSubmit} className={style.form_main}>
        <span className={style.lbl}>Що тренував</span>
        <div className={style.flexWrap}>
          {defaultTypes.map((ell) => {
            return (
              <button
                type="button"
                key={ell.id}
                className={`${style.btn_name} ${typeId === ell.id ? style.active : ""}`}
                onClick={() => setTypeId(ell.id)}
                aria-pressed={typeId === ell.id}
              >
                {ell.name}
              </button>
            );
          })}
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
          <div>
            {/* тут буде список вправ і підходів */}
            <button type="button" className={style.add_btn}>
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
