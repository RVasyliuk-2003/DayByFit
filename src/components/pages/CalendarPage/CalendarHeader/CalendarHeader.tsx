import style from "./calendarHeader.module.css";

const locale = "uk-UA";

type Props = {
  viewDate: Date;
  setViewDate: (date: Date) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

const CalendarHeader = ({
  viewDate,
  setViewDate,
  selectedDate,
  onSelectDate,
}: Props) => {

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const empty = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(empty).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthName = new Intl.DateTimeFormat(locale, { month: "long" }).format(
    viewDate,
  );

  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
      new Date(2024, 0, 1 + i),
    ),
  );

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <section className="top">
      <header>
        <div className={style.btnBox}>
          <div>
            <h1 className={style.h1}>
              {monthName} {year}
            </h1>
            <p className={style.p}>13 тренувань, 12 год 40 хв</p>
          </div>

          <div className={style.btns}>
            <button onClick={prevMonth} aria-label="Попередній місяць">
              ←
            </button>
            <button onClick={nextMonth} aria-label="Наступний місяць">
              →
            </button>
          </div>
        </div>
      </header>

      <div className={style.week}>
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className={style.grid}>
        {cells.map((cell, id) => {
          if (cell === null) return <div key={id} />;

          const isSelected =
            selectedDate.getFullYear() === year &&
            selectedDate.getMonth() === month &&
            selectedDate.getDate() === cell;

          return (
            <button
              key={id}
              className={
                isSelected ? `${style.day} ${style.selected}` : style.day
              }
              onClick={() => onSelectDate(new Date(year, month, cell))}
              aria-pressed={isSelected}
            >
              {cell}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CalendarHeader;
