import { useEffect, useState } from "react";
import type { Workout } from "./types";

const STORAGE_KEY = "daybyfit:workouts";

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Workout[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  }, [workouts]);

  const addWorkout = (workout: Workout) =>
    setWorkouts((prev) => [...prev, workout]);

  const removeWorkout = (id: string) =>
    setWorkouts((prev) => prev.filter((w) => w.id !== id));

  return { workouts, addWorkout, removeWorkout };
};
