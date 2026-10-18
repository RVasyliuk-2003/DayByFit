import type { Workout } from "./types";
import { fetchWorkouts, insertWorkout, deleteWorkoutById } from "./cloud";
import { useSyncedList } from "./useSyncedList";

export const useWorkouts = () => {
  const list = useSyncedList<Workout>({
    storageKey: "daybyfit:workouts",
    fetchAll: fetchWorkouts,
    insert: insertWorkout,
    remove: deleteWorkoutById,
  });

  return {
    workouts: list.items,
    addWorkout: list.add,
    removeWorkout: list.remove,
    loading: list.loading,
    error: list.error,
    retry: list.retry,
    dismissError: list.dismissError,
  };
};
