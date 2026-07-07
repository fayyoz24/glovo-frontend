import { Outlet, useNavigate } from "react-router-dom";
import { Loader2, Bike, ArrowLeft, Clock } from "lucide-react";
import { CourierProvider, useCourier } from "../../context/CourierContext";
import CourierBottomNav from "./CourierBottomNav";
import OrderOfferSheet from "./OrderOfferSheet";

export default function CourierLayout() {
  return (
    <CourierProvider>
      <CourierLayoutInner />
    </CourierProvider>
  );
}

function CourierLayoutInner() {
  const { loadingProfile, profile } = useCourier();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <header className="flex items-center gap-3 border-b-2 border-ink/10 bg-white px-4 py-3">
        <button
          onClick={() => navigate("/")}
          aria-label="Mijoz ilovasiga qaytish"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/50 hover:bg-ink/5"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ceramic text-white">
          <Bike size={18} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm text-ink">Kuryer paneli</p>
          {profile?.full_name && <p className="truncate text-xs text-ink/50">{profile.full_name}</p>}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-4">
        {loadingProfile ? (
          <div className="grid min-h-[50vh] place-items-center">
            <Loader2 className="animate-spin text-ink/40" size={28} />
          </div>
        ) : !profile ? (
          <div className="grid min-h-[50vh] place-items-center text-center">
            <div>
              <p className="font-display text-lg text-ink">Kuryer profili topilmadi</p>
              <p className="mt-1 text-sm text-ink/50">Iltimos, qo'llab-quvvatlash bilan bog'laning.</p>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      {profile?.is_approved && <OrderOfferSheet />}
      <CourierBottomNav />
    </div>
  );
}
