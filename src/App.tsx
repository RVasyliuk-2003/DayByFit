import "./reset.css";
import "./App.css";

import CalendarPage from "./components/pages/CalendarPage/CalendarPage";
import ProgressPage from "./components/pages/ProgressPage/ProgressPage";
import AddWorkoutPage from "./components/pages/AddWorkoutPage/AddWorkoutPage";
import SummaryPage from "./components/pages/SummaryPage/SummaryPage";
import ExercisesPage from "./components/pages/ExercisesPage/ExercisesPage";
import NavBar from "./components/NavBar/NavBar";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <main className="mobileContainer">
        <Routes>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/ProgressPage" element={<ProgressPage />} />
          <Route path="/AddWorkoutPage" element={<AddWorkoutPage />} />
          <Route path="/SummaryPage" element={<SummaryPage />} />
          <Route path="/ExercisesPage" element={<ExercisesPage />} />
        </Routes>
      </main>
      <NavBar />
    </BrowserRouter>
  );
}

export default App;
