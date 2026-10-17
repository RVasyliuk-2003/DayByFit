import CalendarHeader from "./CalendarHeader/CalendarHeader";
import CalendarContent from "./CalendarContent/CalendarContent";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import type { Workout, WorkoutType } from "../../../types";

import { parseDateKey } from "../../../date";

type Props = {
  workouts: Workout[];
  types: WorkoutType[];
  onDelete: (id: string) => void;
};

const CalendarPage = ({ workouts, types, onDelete }: Props) => {
  const [searchParams] = useSearchParams();
  const initial = parseDateKey(searchParams.get("date")) ?? new Date();

  const [viewDate, setViewDate] = useState(new Date(initial)); // який місяць показаний
  const [selectedDate, setSelectedDate] = useState(new Date(initial)); // який день обраний

  return (
    <section>
      <CalendarHeader
        viewDate={viewDate}
        setViewDate={setViewDate}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        workouts={workouts}
        types={types}
      />

      <CalendarContent
        selectedDate={selectedDate}
        workouts={workouts}
        types={types}
        onDelete={onDelete}
      />
    </section>
  );
};

export default CalendarPage;
