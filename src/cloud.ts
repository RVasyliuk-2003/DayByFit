import { supabase } from "./supabase";
import type { Exercise, TimeOfDay, Workout, WorkoutType } from "./types";

type WorkoutRow = {
  id: string;
  date: string;
  time_of_day: string;
  duration_min: number;
  type_id: string;
  exercises: Exercise[] | null;
  note: string | null;
};

type TypeRow = {
  id: string;
  name: string;
  color: string;
  has_exercises: boolean;
};

const toWorkout = (r: WorkoutRow): Workout => ({
  id: r.id,
  date: r.date,
  timeOfDay: r.time_of_day as TimeOfDay,
  durationMin: r.duration_min,
  typeId: r.type_id,
  exercises: r.exercises ?? undefined,
  note: r.note ?? undefined,
});

export const fetchWorkouts = async (): Promise<Workout[]> => {
  const { data, error } = await supabase.from("workouts").select("*");
  if (error) throw error;
  return (data as WorkoutRow[]).map(toWorkout);
};

export const insertWorkout = async (w: Workout) => {
  const { error } = await supabase.from("workouts").insert({
    id: w.id,
    date: w.date,
    time_of_day: w.timeOfDay,
    duration_min: w.durationMin,
    type_id: w.typeId,
    exercises: w.exercises ?? null,
    note: w.note ?? null,
  });
  if (error) throw error;
};

export const deleteWorkoutById = async (id: string) => {
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) throw error;
};

export const updateWorkoutById = async (w: Workout) => {
  const { data, error } = await supabase
    .from("workouts")
    .update({
      date: w.date,
      time_of_day: w.timeOfDay,
      duration_min: w.durationMin,
      type_id: w.typeId,
      exercises: w.exercises ?? null,
      note: w.note ?? null,
    })
    .eq("id", w.id)
    .select("id");
  if (error) throw error;
  
  // якщо правила бази не дозволили, рядків оновлено 0, і це теж збій
  if (!data || data.length === 0) throw new Error("not updated");
};

export const fetchTypes = async (): Promise<WorkoutType[]> => {
  const { data, error } = await supabase.from("workout_types").select("*");
  if (error) throw error;
  return (data as TypeRow[]).map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color,
    hasExercises: r.has_exercises,
  }));
};

export const insertType = async (t: WorkoutType) => {
  const { error } = await supabase.from("workout_types").insert({
    id: t.id,
    name: t.name,
    color: t.color,
    has_exercises: t.hasExercises,
  });
  if (error) throw error;
};
