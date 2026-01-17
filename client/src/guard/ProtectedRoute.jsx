import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const storedRole = localStorage.getItem("role");

  // not logged in at all
  if (!storedRole) {
    return <Navigate to="/" replace />;
  }

  // logged in but wrong role
  if (role && storedRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
