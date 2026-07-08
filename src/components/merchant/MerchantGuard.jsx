import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const MERCHANT_ROLES = ["merchant_owner", "merchant_manager"];

export default function MerchantGuard({ children }) {
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

  if (!MERCHANT_ROLES.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
