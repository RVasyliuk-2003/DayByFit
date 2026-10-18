import type { WorkoutType } from "./types";
// import type { TimeOfDay } from "./types";
import i18n from "./i18n";

export const typeName = (type?: WorkoutType) =>
  type ? i18n.t(`types.${type.id}`, { defaultValue: type.name }) : "";

export const defaultTypes: WorkoutType[] = [
  { id: "gym", name: "Зал", color: "#2B59FF", hasExercises: true },
  { id: "box", name: "Бокс", color: "#D6362A", hasExercises: false },
  { id: "run", name: "Біг", color: "#15803D", hasExercises: false },
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
  "#15803D",
  "#8B5CF6",
  "#0891B2",
  "#EA580C",
  "#DB2777",
  "#64748B",
];
