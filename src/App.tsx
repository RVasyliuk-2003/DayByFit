import "./reset.css";
import "./App.css";
import AccountPage from "./components/pages/AccountPage/AccountPage";

import CalendarPage from "./components/pages/CalendarPage/CalendarPage";
import ProgressPage from "./components/pages/ProgressPage/ProgressPage";
import AddWorkoutPage from "./components/pages/AddWorkoutPage/AddWorkoutPage";
import SummaryPage from "./components/pages/SummaryPage/SummaryPage";
import ExercisesPage from "./components/pages/ExercisesPage/ExercisesPage";
import NavBar from "./components/NavBar/NavBar";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useWorkouts } from "./useWorkouts";
import { useWorkoutTypes } from "./useWorkoutTypes";
import LangSwitch from "./components/LangSwitch/LangSwitch";

const App = () => {
  const { workouts, addWorkout, removeWorkout } = useWorkouts();
  const { types, addType } = useWorkoutTypes();

  return (
    <BrowserRouter>
      <main className="mobileContainer">
        <LangSwitch />
        <Routes>
          <Route path="/account" element={<AccountPage />} />
          <Route
            path="/"
            element={
              <CalendarPage
                workouts={workouts}
                types={types}
                onDelete={removeWorkout}
              />
            }
          />
          <Route
            path="/progress"
            element={<ProgressPage workouts={workouts} />}
          />
          <Route
            path="/add"
            element={
              <AddWorkoutPage
                onAdd={addWorkout}
                types={types}
                onAddType={addType}
              />
            }
          />
          <Route
            path="/summary"
            element={<SummaryPage workouts={workouts} types={types} />}
          />
          <Route
            path="/exercises"
            element={<ExercisesPage workouts={workouts} />}
          />
        </Routes>
      </main>
      <NavBar />
    </BrowserRouter>
  );
};

export default App;
