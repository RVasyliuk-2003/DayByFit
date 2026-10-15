import { useEffect, useState } from "react";
import type { WorkoutType } from "./types";
import { defaultTypes } from "./workoutTypes";

const STORAGE_KEY = "daybyfit:types";

export function useWorkoutTypes() {
  const [customTypes, setCustomTypes] = useState<WorkoutType[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customTypes));
  }, [customTypes]);

  const types = [...defaultTypes, ...customTypes];

  const addType = (t: WorkoutType) => setCustomTypes((prev) => [...prev, t]);

  return { types, addType };
}
