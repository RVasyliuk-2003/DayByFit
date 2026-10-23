import type { WorkoutType } from "./types";
// import type { TimeOfDay } from "./types";
import i18n from "./i18n";

export const typeName = (type?: WorkoutType) =>
  type ? i18n.t(`types.${type.id}`, { defaultValue: type.name }) : "";

export const defaultTypes: WorkoutType[] = [
  { id: "gym", name: "Зал", color: "#2B59FF", hasExercises: true },
];

// export const timeLabels: Record<TimeOfDay, string> = {
//   morning: "Ранок",
//   day: "День",
//   evening: "Вечір",
//   night: "Ніч",
// };

export const getType = (types: WorkoutType[], id: string) =>
  types.find((t) => t.id === id);

export const typeColors = [
  "#8B5CF6",
  "#C026D3",
  "#DB2777",
  "#EA580C",
  "#92400E",
  "#A16207",
  "#4D7C0F",
  "#0D9488",
  "#0891B2",
  "#0369A1",
  "#64748B",
  "#334155",
];
