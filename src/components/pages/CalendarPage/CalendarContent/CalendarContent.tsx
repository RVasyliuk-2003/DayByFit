import style from "./calendarContent.module.css";
import ExerciseRow from "./ExerciseRow";

import type { Workout, WorkoutType } from "../../../../types";
import { toDateKey, fmtDur } from "../../../../date";
import { getType, timeLabels } from "../../../../workoutTypes";

type Props = {
  selectedDate: Date;
  workouts: Workout[];
  types: WorkoutType[];
};

const CalendarContent = ({ selectedDate, workouts, types }: Props) => {
  const selectedKey = toDateKey(selectedDate);
  const dayWorkouts = workouts.filter((w) => w.date === selectedKey);

  return (
    <section className={style.list}>
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
            </article>
          );
        })
      )}
    </section>
  );
};

export default CalendarContent;
