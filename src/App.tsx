import "./reset.css";
import "./App.css";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import RequireAuth from "./auth/RequireAuth";
import { useAuth } from "./auth/authContext";

import CalendarPage from "./components/pages/CalendarPage/CalendarPage";
import NavBar from "./components/NavBar/NavBar";
import LangSwitch from "./components/LangSwitch/LangSwitch";
import SyncStatus from "./components/SyncStatus/SyncStatus";

import { useWorkouts } from "./useWorkouts";
import { useWorkoutTypes } from "./useWorkoutTypes";
import { getExerciseNames } from "./progress";

const AccountPage = lazy(
  () => import("./components/pages/AccountPage/AccountPage"),
);
const ProgressPage = lazy(
  () => import("./components/pages/ProgressPage/ProgressPage"),
);
const AddWorkoutPage = lazy(
  () => import("./components/pages/AddWorkoutPage/AddWorkoutPage"),
);
const SummaryPage = lazy(
  () => import("./components/pages/SummaryPage/SummaryPage"),
);
const ExercisesPage = lazy(
  () => import("./components/pages/ExercisesPage/ExercisesPage"),
);
// чат несе важкий react-markdown, тож вантажиться окремо
const Coach = lazy(() => import("./components/Coach/Coach"));

const App = () => {
  const { user } = useAuth();

  const {
    workouts,
    addWorkout,
    removeWorkout,
    loading: wLoading,
    error: wError,
    retry: wRetry,
    dismissError: wDismiss,
  } = useWorkouts();
  const {
    types,
    addType,
    loading: tLoading,
    error: tError,
    retry: tRetry,
    dismissError: tDismiss,
  } = useWorkoutTypes();

  return (
    <BrowserRouter>
      <main className="mobileContainer">
        <LangSwitch />
        <SyncStatus
          loading={wLoading || tLoading}
          error={wError || tError}
          onRetry={() => {
            wRetry();
            tRetry();
          }}
          onDismiss={() => {
            wDismiss();
            tDismiss();
          }}
        />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/account" element={<AccountPage />} />
            {/* усе, що нижче, лише для залогінених */}
            <Route element={<RequireAuth />}>
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
                    exerciseNames={getExerciseNames(workouts)}
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
            </Route>
          </Routes>
        </Suspense>
      </main>
      {user && <NavBar />}
      <Suspense fallback={null}>
        <Coach />
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
