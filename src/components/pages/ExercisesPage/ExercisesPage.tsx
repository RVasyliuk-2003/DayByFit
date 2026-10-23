import ExercisesHeader from "./ExercisesHeader/ExercisesHeader";
import ExercisesContent from "./ExercisesContent/ExercisesContent";
import type { Workout } from "../../../types";

type Props = { workouts: Workout[]; onUpdate: (w: Workout) => void };

const ExercisesPage = ({ workouts, onUpdate }: Props) => {
  return (
    <section>
      <ExercisesHeader />
      <ExercisesContent workouts={workouts} onUpdate={onUpdate} />
    </section>
  );
};

export default ExercisesPage;
