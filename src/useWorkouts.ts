import { useEffect, useState } from "react";
import type { Workout } from "./types";
import { useAuth } from "./auth/authContext";
import { fetchWorkouts, insertWorkout, deleteWorkoutById } from "./cloud";

const STORAGE_KEY = "daybyfit:workouts";

const readLocal = (): Workout[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Workout[]) : [];
  } catch {
    return [];
  }
};

// uid потрібен, щоб після зміни акаунта не показати чужий список, поки вантажиться свій
type Cloud = { uid: string; list: Workout[] };

export const useWorkouts = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [local, setLocal] = useState<Workout[]>(readLocal);
  const [cloud, setCloud] = useState<Cloud | null>(null);

  // дані гостя (без входу) зберігаємо в браузері, як і раніше
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
  }, [local]);

  // після входу завантажуємо тренування акаунта
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    fetchWorkouts()
      .then((list) => {
        if (!cancelled) setCloud({ uid: userId, list });
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const workouts = userId ? (cloud?.uid === userId ? cloud.list : []) : local;

  const changeCloud = (fn: (list: Workout[]) => Workout[]) =>
    setCloud((prev) =>
      prev && prev.uid === userId
        ? { uid: prev.uid, list: fn(prev.list) }
        : prev,
    );

  // оптимістично: спершу показуємо, потім пишемо в базу; не вийшло, то відкочуємо
  const addWorkout = (workout: Workout) => {
    if (!userId) {
      setLocal((prev) => [...prev, workout]);
      return;
    }
    changeCloud((list) => [...list, workout]);
    insertWorkout(workout).catch(() =>
      changeCloud((list) => list.filter((w) => w.id !== workout.id)),
    );
  };

  const removeWorkout = (id: string) => {
    if (!userId) {
      setLocal((prev) => prev.filter((w) => w.id !== id));
      return;
    }
    const removed = workouts.find((w) => w.id === id);
    changeCloud((list) => list.filter((w) => w.id !== id));
    deleteWorkoutById(id).catch(() => {
      if (removed) changeCloud((list) => [...list, removed]);
    });
  };

  return { workouts, addWorkout, removeWorkout };
};
