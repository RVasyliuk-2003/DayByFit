import AddWorkoutHeader from "./AddWorkoutHeader/AddWorkoutHeader";
import AddWorkoutContent from "./AddWorkoutContent/AddWorkoutContent";

import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { Workout, WorkoutType } from "../../../types";

type Props = {
  workouts: Workout[];
  onAdd: (workout: Workout) => void;
  onUpdate: (workout: Workout) => void;
  types: WorkoutType[];
  onAddType: (type: WorkoutType) => void;
  exerciseNames: string[];
};

const AddWorkoutPage = ({
  workouts,
  onAdd,
  onUpdate,
  types,
  onAddType,
  exerciseNames,
}: Props) => {
  const { t } = useTranslation();
  const [params] = useSearchParams();

  const editId = params.get("edit");
  const editing = editId ? workouts.find((w) => w.id === editId) : undefined;

  return (
    <section>
      <AddWorkoutHeader />
      {editId && !editing ? (
        // тренування ще вантажиться або такого id нема
        <p style={{ padding: "20px" }}>
          {t("form.notFound")} <Link to="/">{t("form.toCalendar")}</Link>
        </p>
      ) : (
        <AddWorkoutContent
          key={editing?.id ?? "new"}
          editing={editing}
          onAdd={onAdd}
          onUpdate={onUpdate}
          types={types}
          onAddType={onAddType}
          exerciseNames={exerciseNames}
        />
      )}
    </section>
  );
};

export default AddWorkoutPage;
