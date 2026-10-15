import style from "./calendarContent.module.css";

import type { Workout } from "../../../../types";
import { toDateKey } from "../../../../types";
import { getType } from "../../../../workoutTypes";

type Props = {
  selectedDate: Date;
  workouts: Workout[];
};

const CalendarContent = ({ selectedDate, workouts }: Props) => {
  const selectedKey = toDateKey(selectedDate);
  const dayWorkouts = workouts.filter((w) => w.date === selectedKey);
  return (
    <section>
      {dayWorkouts.length === 0 ? (
        <p className={style.noTreaning}>У цей день тренувань немає</p>
      ) : (
        dayWorkouts.map((w) => {
          const type = getType(w.typeId);
          return (
            <article key={w.id}>
              <h3>{type?.name}</h3>
              <p>{w.durationMin} хв</p>
            </article>
          );
        })
      )}
    </section>
  );
};

export default CalendarContent;
