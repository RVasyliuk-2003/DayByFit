// import style from "./calendarContent.module.css";

import type { Workout } from "../../../../types";

type Props = {
  selectedDate: Date;
  workouts: Workout[];
};

const CalendarContent = ({ selectedDate, workouts }: Props) => {
  return <section></section>;
};

export default CalendarContent;
