import "./reset.css";
import "./App.css";

import CalendarPage from "./components/pages/CalendarPage/CalendarPage";
import ProgressPage from "./components/pages/ProgresPage/ProgressPage";
import NavBar from "./components/NavBar/NavBar";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <main className="mobileContainer">
        <Routes>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/ProgressPage" element={<ProgressPage />} />
        </Routes>
      </main>
      <NavBar />
    </BrowserRouter>
  );
}

export default App;
