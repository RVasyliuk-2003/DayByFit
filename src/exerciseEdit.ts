import type { Workout } from "./types";

// назви порівнюємо без урахування регістру й пробілів, як і при групуванні вправ
const same = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

export const workoutsWithExercise = (workouts: Workout[], name: string) =>
  workouts.filter((w) => w.exercises?.some((e) => same(e.name, name)));

export const withoutExercise = (w: Workout, name: string): Workout => ({
  ...w,
  exercises: w.exercises?.filter((e) => !same(e.name, name)),
});

export const renameExercise = (w: Workout, from: string, to: string): Workout => ({
  ...w,
  exercises: w.exercises?.map((e) => (same(e.name, from) ? { ...e, name: to } : e)),
});