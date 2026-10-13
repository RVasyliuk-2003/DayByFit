import "./reset.css";
import "./App.css";

import CalendarPage from "./components/pages/CalendarPage/CalendarPage";
import NavBar from "./components/NavBar/NavBar";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <main className="mobileContainer">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/NavBar" element={<NavBar />} />
          </Routes>
        </BrowserRouter>
      </main>
    </>
  );
}

export default App;
