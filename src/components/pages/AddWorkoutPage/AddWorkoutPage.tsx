import AddWorkoutHeader from "./AddWorkoutHeader/AddWorkoutHeader";
import AddWorkoutContent from "./AddWorkoutContent/AddWorkoutContent";

// import type { Workout } from "../../../types";
// type Props = { onAdd: (workout: Workout) => void };

const AddWorkoutPage = () => {
  return (
    <section>
      <AddWorkoutHeader />
      <AddWorkoutContent />
      {/* onAdd={onAdd} */}
    </section>
  );
};

export default AddWorkoutPage;
