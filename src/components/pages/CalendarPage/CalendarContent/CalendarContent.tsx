import style from "./calendarContent.module.css";
import ExerciseRow from "./ExerciseRow";
import { Link } from "react-router-dom";

import type { Workout, WorkoutType } from "../../../../types";
import { toDateKey, fmtDur } from "../../../../date";
import { getType, timeLabels } from "../../../../workoutTypes";

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
  const selectedKey = toDateKey(selectedDate);
  const dayWorkouts = workouts.filter((w) => w.date === selectedKey);

  const handleDelete = (id: string) => {
    if (window.confirm("Видалити це тренування?")) onDelete(id);
  };

  return (
    <section className={style.list} style={{padding: "20px 20px 24px"}}>
      {dayWorkouts.length === 0 ? (
        <p className={style.noTraining}>У цей день тренувань немає</p>
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
                <h3>{type?.name}</h3>
                <span>
                  {timeLabels[w.timeOfDay]}, {fmtDur(w.durationMin)}
                </span>
              </header>

              {w.exercises?.map((ex, i) => (
                <ExerciseRow key={i} exercise={ex} />
              ))}

              {w.note && <p className={style.note}>{w.note}</p>}

              <button
                type="button"
                className={style.del}
                onClick={() => handleDelete(w.id)}
              >
                Видалити
              </button>
            </article>
          );
        })
      )}

      <Link to={`/add?date=${selectedKey}`} className={style.addLink}>
        + Додати тренування
      </Link>
    </section>
  );
};

export default CalendarContent;
