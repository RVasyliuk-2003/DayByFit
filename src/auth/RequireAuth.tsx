import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./authContext";

const RequireAuth = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // сесія ще перевіряється, щоб не було хибного перекидання
  if (!user) return <Navigate to="/account" replace />;
  return <Outlet />;
};

export default RequireAuth;
