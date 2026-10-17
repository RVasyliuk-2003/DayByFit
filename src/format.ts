import type { WorkoutSet } from "./types";

const rules = new Intl.PluralRules("uk-UA");

export const plural = (n: number, one: string, few: string, many: string) => {
  const cat = rules.select(n);
  return cat === "one" ? one : cat === "few" ? few : many;
};

export const fmtSet = (weight: number, reps: number) =>
  weight > 0 ? `${weight} кг × ${reps}` : `${reps} повт.`;

export const topSet = (sets: WorkoutSet[]) =>
  sets.reduce((best, s) =>
    s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps)
      ? s
      : best,
  );
