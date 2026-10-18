import { useEffect, useState } from "react";
import type { WorkoutType } from "./types";
import { defaultTypes } from "./workoutTypes";
import { useAuth } from "./auth/authContext";
import { fetchTypes, insertType } from "./cloud";

const STORAGE_KEY = "daybyfit:types";

const readLocal = (): WorkoutType[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WorkoutType[]) : [];
  } catch {
    return [];
  }
};

type Cloud = { uid: string; list: WorkoutType[] };

export function useWorkoutTypes() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [local, setLocal] = useState<WorkoutType[]>(readLocal);
  const [cloud, setCloud] = useState<Cloud | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
  }, [local]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    fetchTypes()
      .then((list) => {
        if (!cancelled) setCloud({ uid: userId, list });
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const customTypes = userId
    ? cloud?.uid === userId
      ? cloud.list
      : []
    : local;
  const types = [...defaultTypes, ...customTypes];

  const changeCloud = (fn: (list: WorkoutType[]) => WorkoutType[]) =>
    setCloud((prev) =>
      prev && prev.uid === userId
        ? { uid: prev.uid, list: fn(prev.list) }
        : prev,
    );

  const addType = (t: WorkoutType) => {
    if (!userId) {
      setLocal((prev) => [...prev, t]);
      return;
    }
    changeCloud((list) => [...list, t]);
    insertType(t).catch(() =>
      changeCloud((list) => list.filter((x) => x.id !== t.id)),
    );
  };

  return { types, addType };
}
