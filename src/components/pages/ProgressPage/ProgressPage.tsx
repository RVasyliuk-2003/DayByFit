import { useState } from "react";
import type { Workout } from "../../../types";
import { getExerciseNames } from "../../../progress";
import ProgressHeader from "./ProgressHeader/ProgressHeader";
import ProgressContent from "./ProgressContent/ProgressContent";

type Props = { workouts: Workout[] };

const ProgressPage = ({ workouts }: Props) => {
  const names = getExerciseNames(workouts);
  const [picked, setPicked] = useState<string | null>(null);

  // якщо вибраної вправи вже немає (видалили тренування), беремо першу
  const exercise = picked && names.includes(picked) ? picked : (names[0] ?? "");

  return (
    <section>
      <ProgressHeader names={names} value={exercise} onChange={setPicked} />
      <ProgressContent workouts={workouts} exercise={exercise} />
    </section>
  );
};

export default ProgressPage;
