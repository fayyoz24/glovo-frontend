import { Loader2, Navigation, PackageCheck, Store, MapPin } from "lucide-react";
import { useCourier } from "../../context/CourierContext";
import { formatSum } from "../../utils/format";
import StatusBadge from "../StatusBadge";

export default function ActiveOrderCard({ order }) {
  const { markPickedUp, markDelivered, busy } = useCourier();

  const isAssigned = order.status === "courier_assigned";
  const isOnTheWay = order.status === "picked_up" || order.status === "on_the_way";

  return (
    <div className="space-y-4 rounded-tile border-2 border-ink/10 bg-white p-4 shadow-tile">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate font-display text-base text-ink">
            <Store size={16} className="shrink-0 text-ink/40" />
            {order.merchant_name}
          </p>
          <p className="mt-0.5 text-xs text-ink/50">#{order.public_id}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex items-center justify-between rounded-xl bg-paper p-3 text-sm">
        <span className="flex items-center gap-1.5 text-ink/60">
          <MapPin size={14} /> {order.item_count} mahsulot
        </span>
        <span className="font-display text-ceramic-dark">{formatSum(order.total_amount)}</span>
      </div>

      {isAssigned && (
        <button
          onClick={() => markPickedUp(order.id)}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-display text-paper shadow-tile disabled:opacity-40"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
          Mahsulotni oldim
        </button>
      )}

      {isOnTheWay && (
        <button
          onClick={() => markDelivered(order.id)}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ceramic py-3 text-sm font-display text-white shadow-tile disabled:opacity-40"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
          Yetkazib berdim
        </button>
      )}
    </div>
  );
}
