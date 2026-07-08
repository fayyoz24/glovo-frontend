import { LogOut, MapPin, Phone, Clock, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMerchant } from "../../context/MerchantContext";
import { useAuth } from "../../context/AuthContext";

export default function MerchantProfilePage() {
  const { profile, toggleAcceptingOrders } = useMerchant();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const branch = profile?.branch;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="space-y-4 pb-6">
      <h1 className="font-display text-xl text-ink">Do'kon</h1>

      <div className="rounded-tile border-2 border-ink/10 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-marigold text-ink">
            <Store size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg text-ink">{profile?.merchant_name}</p>
            <p className="text-xs text-ink/50">{profile?.position || "Xodim"}</p>
          </div>
        </div>
      </div>

      {branch && (
        <div className="space-y-3 rounded-tile border-2 border-ink/10 bg-white p-4">
          <p className="font-display text-base text-ink">{branch.name}</p>
          <div className="space-y-2 text-sm text-ink/60">
            <p className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" /> {branch.address_text}
            </p>
            {branch.phone && (
              <p className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" /> {branch.phone}
              </p>
            )}
            <p className="flex items-center gap-2">
              <Clock size={16} className="shrink-0" />
              O'rtacha tayyorlash: {branch.prep_time_min} daq
            </p>
          </div>

          <button
            onClick={() => toggleAcceptingOrders(!branch.accepting_orders)}
            className={`w-full rounded-full py-3 text-sm font-display shadow-tile transition ${
              branch.accepting_orders
                ? "bg-ceramic text-white"
                : "bg-pomegranate text-white"
            }`}
          >
            {branch.accepting_orders
              ? "Buyurtmalarni to'xtatish"
              : "Buyurtmalarni qayta yoqish"}
          </button>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink/10 bg-white py-3 text-sm font-display text-pomegranate-dark"
      >
        <LogOut size={16} /> Chiqish
      </button>
    </div>
  );
}
