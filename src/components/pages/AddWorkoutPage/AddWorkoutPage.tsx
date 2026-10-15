import AddWorkoutHeader from "./AddWorkoutHeader/AddWorkoutHeader";
import AddWorkoutContent from "./AddWorkoutContent/AddWorkoutContent";

import type { Workout, WorkoutType } from "../../../types";

type Props = {
  onAdd: (workout: Workout) => void;
  types: WorkoutType[];
  onAddType: (type: WorkoutType) => void;
};

const AddWorkoutPage = ({ onAdd, types, onAddType }: Props) => (
  <section>
    <AddWorkoutHeader />
    <AddWorkoutContent onAdd={onAdd} types={types} onAddType={onAddType} />
  </section>
);

export default AddWorkoutPage;
