import type { WorkoutType } from "./types";
import { defaultTypes } from "./workoutTypes";
import { fetchTypes, insertType, deleteTypeById } from "./cloud";
import { useSyncedList } from "./useSyncedList";

export function useWorkoutTypes() {
  const list = useSyncedList<WorkoutType>({
    storageKey: "daybyfit:types",
    fetchAll: fetchTypes,
    insert: insertType,
    remove: deleteTypeById,
  });

  return {
    types: [...defaultTypes, ...list.items],
    addType: list.add,
    removeType: list.remove,
    loading: list.loading,
    error: list.error,
    retry: list.retry,
    dismissError: list.dismissError,
  };
}
