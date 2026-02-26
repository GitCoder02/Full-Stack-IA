import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, role }) {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/login" />;

  if (role && currentUser.role !== role) {
    return currentUser.role === "admin" ? (
      <Navigate to="/admin" />
    ) : (
      <Navigate to="/dashboard" />
    );
  }

  return children;
}

export default ProtectedRoute;
