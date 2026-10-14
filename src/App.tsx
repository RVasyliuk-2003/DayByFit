import "./reset.css";
import "./App.css";

import CalendarPage from "./components/pages/CalendarPage/CalendarPage";
import ProgressPage from "./components/pages/ProgressPage/ProgressPage";
import AddWorkoutPage from "./components/pages/AddWorkoutPage/AddWorkoutPage";
import SummaryPage from "./components/pages/SummaryPage/SummaryPage";
import ExercisesPage from "./components/pages/ExercisesPage/ExercisesPage";
import NavBar from "./components/NavBar/NavBar";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useWorkouts } from "./useWorkouts";

const App = () => {
  const { workouts, addWorkout } = useWorkouts();

  return (
    <BrowserRouter>
      <main className="mobileContainer">
        <Routes>
          <Route path="/" element={<CalendarPage workouts={workouts} />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/add" element={<AddWorkoutPage onAdd={addWorkout} />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
        </Routes>
      </main>
      <NavBar />
    </BrowserRouter>
  );
};

export default App;
