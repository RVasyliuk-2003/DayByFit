import type { WorkoutType } from "./types";

export const defaultTypes: WorkoutType[] = [
  { id: "gym", name: "Зал", color: "#2B59FF", hasExercises: true },
  { id: "box", name: "Бокс", color: "#D6362A", hasExercises: false },
  { id: "run", name: "Біг", color: "#15803D", hasExercises: false },
];

export const getType = (id: string) => defaultTypes.find((t) => t.id === id);

import type { TimeOfDay } from "./types";

export const timeLabels: Record<TimeOfDay, string> = {
  morning: "Ранок",
  day: "День",
  evening: "Вечір",
  night: "Ніч",
};
