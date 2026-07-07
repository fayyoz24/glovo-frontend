import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function CourierGuard({ children }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="animate-spin text-ink/40" size={28} />
      </div>
    );
  }

  if (status === "guest") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== "courier") {
    return <Navigate to="/" replace />;
  }

  return children;
}
