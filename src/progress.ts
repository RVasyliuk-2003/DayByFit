import type { Workout } from "./types";

export type ExercisePoint = {
  date: string;
  topWeight: number;
  topReps: number;
  sets: number;
};

const normalize = (name: string) => name.trim().toLowerCase();

// Усі вправи, найсвіжіші зверху
export const getExerciseNames = (workouts: Workout[]): string[] => {
  const latest = new Map<string, { name: string; date: string }>();

  for (const w of workouts) {
    for (const ex of w.exercises ?? []) {
      if (ex.sets.length === 0) continue;
      const key = normalize(ex.name);
      const prev = latest.get(key);
      if (!prev || w.date >= prev.date) {
        latest.set(key, { name: ex.name.trim(), date: w.date });
      }
    }
  }

  return [...latest.values()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((x) => x.name);
};

// Історія однієї вправи від старих записів до нових
export const getExerciseHistory = (workouts: Workout[], name: string) => {
  const key = normalize(name);
  const points: ExercisePoint[] = [];

  for (const w of workouts) {
    for (const ex of w.exercises ?? []) {
      if (normalize(ex.name) !== key || ex.sets.length === 0) continue;
      points.push({
        date: w.date,
        topWeight: Math.max(...ex.sets.map((s) => s.weight)),
        topReps: Math.max(...ex.sets.map((s) => s.reps)),
        sets: ex.sets.length,
      });
    }
  }

  points.sort((a, b) => a.date.localeCompare(b.date));
  const bodyweight =
    points.length > 0 && points.every((p) => p.topWeight === 0);

  return { points, bodyweight };
};
