export type WorkoutSet = {
  weight: number; // кг, 0 якщо без ваги
  reps: number;
};

export type Exercise = {
  name: string;
  sets: WorkoutSet[];
};

export type TimeOfDay = "morning" | "day" | "evening" | "night";

export type WorkoutType = {
  id: string;
  name: string; // "Зал", "Бокс", "Біг"
  color: string; // "#2B59FF"
  hasExercises: boolean; // чи записувати вправи й підходи
};

export type Workout = {
  id: string;
  date: string; // "2026-10-14"
  timeOfDay: TimeOfDay;
  durationMin: number;
  typeId: string; // посилання на WorkoutType
  exercises?: Exercise[]; // тільки там, де hasExercises
  note?: string; // для боксу, бігу тощо
};

export const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
