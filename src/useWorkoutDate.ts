import { useSearchParams } from "react-router-dom";
import { parseDateKey, toDateKey } from "./date";

// Дата тренування з адреси (?date=2026-10-13), а якщо її немає чи вона зламана, то сьогодні
export const useWorkoutDate = () => {
  const [searchParams] = useSearchParams();
  const dateObj = parseDateKey(searchParams.get("date")) ?? new Date();
  return { dateObj, dateKey: toDateKey(dateObj) };
};
