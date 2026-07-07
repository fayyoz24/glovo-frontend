import { useEffect, useState } from "react";
import { Clock, PackageSearch, Star, Bike as BikeIcon } from "lucide-react";
import { useCourier } from "../../context/CourierContext";
import { courierApi } from "../../api/courier";
import { formatSum } from "../../utils/format";
import OnlineToggle from "../../components/courier/OnlineToggle";
import ActiveOrderCard from "../../components/courier/ActiveOrderCard";
import EmptyState from "../../components/EmptyState";

export default function CourierHomePage() {
  const { profile, activeOrders, isApproved } = useCourier();
  const [shift, setShift] = useState(null);

  useEffect(() => {
    if (!isApproved) return;
    courierApi
      .shift()
      .then(setShift)
      .catch(() => setShift(null));
  }, [isApproved, activeOrders]);

  if (!isApproved) {
    return (
      <div className="mt-6">
        <EmptyState
          icon={Clock}
          title="Hisobingiz tekshirilmoqda"
          description="Administrator hujjatlaringizni tasdiqlashi bilan onlayn bo'lib buyurtma qabul qila olasiz."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <OnlineToggle />

      <div className="grid grid-cols-3 gap-2">
        <StatTile icon={BikeIcon} label="Yetkazishlar" value={profile?.total_deliveries ?? 0} />
        <StatTile icon={Star} label="Reyting" value={Number(profile?.rating ?? 5).toFixed(2)} />
        <StatTile
          icon={Clock}
          label="Smena"
          value={shift ? `${shift.duration_minutes ?? 0} daq` : "—"}
        />
      </div>

      {shift && (
        <div className="rounded-tile border-2 border-ink/10 bg-white p-4">
          <p className="text-xs font-semibold text-ink/50">Joriy smena daromadi</p>
          <p className="mt-1 font-display text-2xl text-ceramic-dark">
            {formatSum(shift.total_earned)}
          </p>
          <p className="mt-0.5 text-xs text-ink/50">{shift.deliveries_count} ta yetkazish</p>
        </div>
      )}

      <section>
        <h2 className="mb-2 font-body text-sm font-bold text-ink">Faol buyurtma</h2>
        {activeOrders?.length ? (
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <ActiveOrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="Faol buyurtma yo'q"
            description="Onlayn bo'lganingizda yangi buyurtma takliflari shu yerda ko'rinadi."
          />
        )}
      </section>
    </div>
  );
}

function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-tile border-2 border-ink/10 bg-white p-3 text-center">
      <Icon size={16} className="text-ceramic-dark" />
      <p className="font-display text-sm text-ink">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/40">{label}</p>
    </div>
  );
}
