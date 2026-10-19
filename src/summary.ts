import i18n from "./i18n";
import { getLocale } from "./i18n/locale";
import type { TimeOfDay, Workout, WorkoutType } from "./types";
import { toDateKey, shortDate } from "./date";
import { getType, typeName } from "./workoutTypes";
import { fmtSet, topSet } from "./format";

export type Period = "week" | "month" | "all" | "custom";

const todOrder: TimeOfDay[] = ["morning", "day", "evening", "night"];

const fullDate = (key: string) => key.split("-").reverse().join(".");

// null означає, що період некоректний (немає дат або «від» пізніше за «до»)
export const getRange = (
  period: Period,
  from: string,
  to: string,
  today = new Date(),
): [string, string] | null => {
  if (period === "week") {
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 6,
    );
    return [toDateKey(start), toDateKey(today)];
  }
  if (period === "month") {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return [toDateKey(first), toDateKey(last)];
  }
  if (period === "all") return ["0000-00-00", "9999-99-99"];
  if (!from || !to || from > to) return null;
  return [from, to];
};

export const getSubtitle = (
  period: Period,
  from: string,
  to: string,
  today = new Date(),
) => {
  if (period === "week") return i18n.t("summary.last7");
  if (period === "all") return i18n.t("summary.all");
  if (period === "month") {
    const name = new Intl.DateTimeFormat(getLocale(i18n.language), {
      month: "long",
    }).format(today);
    return `${name[0].toUpperCase()}${name.slice(1)} ${today.getFullYear()}`;
  }
  return from && to
    ? `${shortDate(from)} – ${shortDate(to)}`
    : i18n.t("summary.pickPeriod");
};

// від старих до нових
export const getRows = (workouts: Workout[], range: [string, string] | null) =>
  range
    ? workouts
        .filter((w) => w.date >= range[0] && w.date <= range[1])
        .sort(
          (a, b) =>
            a.date.localeCompare(b.date) ||
            todOrder.indexOf(a.timeOfDay) - todOrder.indexOf(b.timeOfDay),
        )
    : [];

export const getStats = (rows: Workout[], types: WorkoutType[]) => {
  const totalMin = rows.reduce((sum, w) => sum + w.durationMin, 0);

  const byType = types
    .map((type) => ({
      type,
      count: rows.filter((w) => w.typeId === type.id).length,
    }))
    .filter((x) => x.count > 0);

  let topTod: TimeOfDay | null = null;
  let best = 0;
  for (const tod of todOrder) {
    const n = rows.filter((w) => w.timeOfDay === tod).length;
    if (n > best) {
      best = n;
      topTod = tod;
    }
  }

  return { totalMin, byType, topTod };
};

// коротко для таблиці на екрані
export const shortDetails = (w: Workout) => {
  const lines: string[] = [];

  if (w.exercises && w.exercises.length > 0) {
    const e = w.exercises.length;
    const s = w.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    lines.push(
      `${i18n.t("summary.exercises", { count: e })}, ${i18n.t("summary.sets", { count: s })}`,
    );
  }
  if (w.note) lines.push(w.note);

  return lines.join("\n"); // таблиця вже має white-space: pre-line
};

// повно для файлу
const fullDetails = (w: Workout) => {
  const parts: string[] = [];

  if (w.exercises && w.exercises.length > 0) {
    parts.push(
      w.exercises
        .map((ex) => {
          if (ex.sets.length === 0) return ex.name;
          const top = topSet(ex.sets);
          return `${ex.name} ${fmtSet(top.weight, top.reps)} (${i18n.t("summary.setsShort", { n: ex.sets.length })})`;
        })
        .join(", "),
    );
  }
  if (w.note) parts.push(w.note);

  return parts.join(" — ");
};

export const buildTable = (
  rows: Workout[],
  types: WorkoutType[],
): string[][] => [
  [
    i18n.t("summary.colDate"),
    i18n.t("summary.colType"),
    i18n.t("summary.csvTime"),
    i18n.t("summary.csvDuration"),
    i18n.t("summary.colDetails"),
  ],
  ...rows.map((w) => {
    const type = getType(types, w.typeId);
    return [
      fullDate(w.date),
      type ? typeName(type) : "—",
      i18n.t(`timeOfDay.${w.timeOfDay}`),
      String(w.durationMin),
      fullDetails(w),
    ];
  }),
];

// ; як роздільник і BOM, щоб Excel з українськими налаштуваннями відкрив правильно
export const toCsv = (table: string[][]) =>
  "\ufeff" +
  table
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(";"))
    .join("\n");

// для вставки в Google Таблиці чи Excel
export const toTsv = (table: string[][]) =>
  table
    .map((r) => r.map((c) => c.replace(/[\t\r\n]+/g, " ")).join("\t"))
    .join("\n");
