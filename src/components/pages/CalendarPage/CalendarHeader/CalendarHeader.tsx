import { useTranslation } from "react-i18next";
import { getLocale } from "../../../../i18n/locale";

import style from "./calendarHeader.module.css";

import type { Workout, WorkoutType } from "../../../../types";
import { fmtDur, toDateKey } from "../../../../date";
import { getType } from "../../../../workoutTypes";

const dayBackground = (colors: string[]) => {
  if (colors.length === 1) return colors[0];
  const step = 100 / colors.length;
  const parts = colors.map(
    (c, i) => `${c} ${(i * step).toFixed(2)}% ${((i + 1) * step).toFixed(2)}%`,
  );
  return `linear-gradient(135deg, ${parts.join(", ")})`;
};

type Props = {
  viewDate: Date;
  setViewDate: (date: Date) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  workouts: Workout[];
  types: WorkoutType[];
};

const CalendarHeader = ({
  viewDate,
  setViewDate,
  selectedDate,
  onSelectDate,
  workouts,
  types,
}: Props) => {
  const { t, i18n } = useTranslation();
  const locale = getLocale(i18n.language);

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

  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthWorkouts = workouts.filter((w) => w.date.startsWith(monthKey));

  const colorsByDate = new Map<string, string[]>();
  for (const w of monthWorkouts) {
    const color = getType(types, w.typeId)?.color;
    if (!color) continue;
    const list = colorsByDate.get(w.date) ?? [];
    if (!list.includes(color)) list.push(color);
    colorsByDate.set(w.date, list);
  }

  const todayKey = toDateKey(new Date());

  const count = monthWorkouts.length;
  const totalMin = monthWorkouts.reduce((sum, w) => sum + w.durationMin, 0);

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
            <p className={style.p}>
              {count === 0
                ? t("calendar.noWorkoutsYet")
                : t("calendar.summary", { count, duration: fmtDur(totalMin) })}
            </p>
          </div>

          <div className={style.btns}>
            <button
              type="button"
              onClick={prevMonth}
              aria-label={t("calendar.prevMonth")}
            >
              ←
            </button>
            <button
              type="button"
              onClick={nextMonth}
              aria-label={t("calendar.nextMonth")}
            >
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

          const key = toDateKey(new Date(year, month, cell));
          const colors = colorsByDate.get(key);

          const className = [
            style.day,
            isSelected && style.selected,
            colors && style.has,
            key === todayKey && style.today,
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              type="button"
              key={id}
              className={className}
              style={colors ? { background: dayBackground(colors) } : undefined}
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
