import type { WorkoutSet } from "./types";
import i18n from "./i18n";

// const rules = new Intl.PluralRules("uk-UA");

// export const plural = (n: number, one: string, few: string, many: string) => {
//   const cat = rules.select(n);
//   return cat === "one" ? one : cat === "few" ? few : many;
// };

export const fmtSet = (weight: number, reps: number) =>
  weight > 0
    ? i18n.t("set.weightReps", { weight, reps })
    : i18n.t("set.reps", { reps });

export const topSet = (sets: WorkoutSet[]) =>
  sets.reduce((best, s) =>
    s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps)
      ? s
      : best,
  );
