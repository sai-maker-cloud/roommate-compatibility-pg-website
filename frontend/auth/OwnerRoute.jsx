import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider.jsx";
import { PageLoader } from "../components/ui/PageLoader.jsx";

export const OwnerRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.role !== "owner") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
