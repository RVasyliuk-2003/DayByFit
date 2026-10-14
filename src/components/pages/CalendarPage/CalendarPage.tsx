import CalendarHeader from "./CalendarHeader/CalendarHeader";
import CalendarContent from "./CalendarContent/CalendarContent";
import { useState } from "react";

const CalendarPage = () => {
  const [viewDate, setViewDate] = useState(new Date()); // який місяць показаний
  const [selectedDate, setSelectedDate] = useState(new Date()); // який день обраний

  return (
    <section>
      <CalendarHeader
        viewDate={viewDate}
        setViewDate={setViewDate}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <CalendarContent selectedDate={selectedDate} />
    </section>
  );
};

export default CalendarPage;
