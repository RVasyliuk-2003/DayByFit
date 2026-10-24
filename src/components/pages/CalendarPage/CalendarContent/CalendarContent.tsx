import style from "./calendarContent.module.css";
import ExerciseRow from "./ExerciseRow";
import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { getType, typeName } from "../../../../workoutTypes";

import type { Workout, WorkoutType } from "../../../../types";
import { toDateKey, fmtDur } from "../../../../date";

type Props = {
  selectedDate: Date;
  workouts: Workout[];
  types: WorkoutType[];
  onDelete: (id: string) => void;
};

const CalendarContent = ({
  selectedDate,
  workouts,
  types,
  onDelete,
}: Props) => {
  const { t } = useTranslation();

  const selectedKey = toDateKey(selectedDate);
  const dayWorkouts = workouts.filter((w) => w.date === selectedKey);

  const handleDelete = (id: string) => {
    if (window.confirm(t("calendar.confirmDelete"))) onDelete(id);
  };

  return (
    <section className={style.list} style={{ padding: "20px 20px 24px" }}>
      {dayWorkouts.length === 0 ? (
        <p className={style.noTraining}>{t("calendar.noWorkouts")}</p>
      ) : (
        dayWorkouts.map((w) => {
          const type = getType(types, w.typeId);
          return (
            <article
              key={w.id}
              className={style.card}
              style={{ "--c": type?.color } as React.CSSProperties}
            >
              <header className={style.cardHead}>
                <h3>{typeName(type)}</h3>
                <span>
                  {t(`timeOfDay.${w.timeOfDay}`)}, {fmtDur(w.durationMin)}
                </span>
              </header>

              {w.exercises?.map((ex, i) => (
                <ExerciseRow key={i} exercise={ex} />
              ))}

              {w.note && <p className={style.note}>{w.note}</p>}

              <div className={style.actions}>
                <Link
                  to={`/add?edit=${w.id}&date=${w.date}`}
                  className={style.edit}
                >
                  {t("calendar.edit")}
                </Link>
                <button
                  type="button"
                  className={style.del}
                  onClick={() => handleDelete(w.id)}
                >
                  {t("calendar.delete")}
                </button>
              </div>
            </article>
          );
        })
      )}

      <Link to={`/add?date=${selectedKey}`} className={style.addLink}>
        {t("calendar.addWorkout")}
      </Link>
    </section>
  );
};

export default CalendarContent;
