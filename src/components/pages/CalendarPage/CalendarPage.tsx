import CalendarHeader from "./CalendarHeader/CalendarHeader";
import CalendarContent from "./CalendarContent/CalendarContent";
import { useState } from "react";

import type { Workout, WorkoutType } from "../../../types";

type Props = { workouts: Workout[]; types: WorkoutType[] };

const CalendarPage = ({ workouts, types }: Props) => {
  const [viewDate, setViewDate] = useState(new Date()); // який місяць показаний
  const [selectedDate, setSelectedDate] = useState(new Date()); // який день обраний

  return (
    <section>
      <CalendarHeader
        viewDate={viewDate}
        setViewDate={setViewDate}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        workouts={workouts}
      />

      <CalendarContent
        selectedDate={selectedDate}
        workouts={workouts}
        types={types}
      />
    </section>
  );
};

export default CalendarPage;
