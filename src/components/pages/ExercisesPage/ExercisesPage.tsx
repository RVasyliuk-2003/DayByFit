import ExercisesHeader from "./ExercisesHeader/ExercisesHeader";
import ExercisesContent from "./ExercisesContent/ExercisesContent";
import type { Workout } from "../../../types";

type Props = { workouts: Workout[] };

const ExercisesPage = ({ workouts }: Props) => {
  return (
    <section>
      <ExercisesHeader />
      <ExercisesContent workouts={workouts} />
    </section>
  );
};

export default ExercisesPage;
