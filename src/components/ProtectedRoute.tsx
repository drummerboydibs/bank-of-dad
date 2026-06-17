import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FullPageSpinner } from "./ui";

/** Requires a signed-in user who has completed household setup. */
export function RequireAuth() {
  const { loading, session, member } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!session) return <Navigate to="/login" replace />;
  if (!member) return <Navigate to="/setup" replace />;
  return <Outlet />;
}

/** Restricts a route to parents; kids get bounced back to their home. */
export function RequireParent() {
  const { role } = useAuth();
  if (role !== "parent") return <Navigate to="/app" replace />;
  return <Outlet />;
}
