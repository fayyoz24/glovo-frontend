import { useState } from "react";
import { Loader2, Navigation, PackageCheck, Store, Wallet } from "lucide-react";
import { useCourier } from "../../context/CourierContext";
import { formatSum } from "../../utils/format";
import StatusBadge from "../StatusBadge";
import DeliveryConfirmModal from "./DeliveryConfirmModal";

export default function ActiveOrderCard({ order }) {
  const { markPickedUp, markDelivered, busy } = useCourier();
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);

  const isAssigned = order.status === "courier_assigned";
  const isOnTheWay = order.status === "picked_up" || order.status === "on_the_way";
  const items = order.items || [];

  const handleConfirmDelivered = async () => {
    await markDelivered(order.id, { cashConfirmed: order.payment_method === "cash" });
    setConfirmingDelivery(false);
  };

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

      {items.length > 0 && (
        <div className="rounded-xl bg-paper p-3 text-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
            Olish kerak bo'lgan mahsulotlar
          </p>
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-2">
                <span className="text-ink">
                  <span className="font-semibold">{item.qty}×</span>{" "}
                  {item.product_name_snapshot}
                  {item.variant_snapshot ? ` (${item.variant_snapshot})` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl bg-paper p-3 text-sm">
        <span className="flex items-center gap-1.5 text-ink/60">
          <Wallet size={14} /> {order.payment_method === "cash" ? "Naqd pul" : "Onlayn to'lov"}
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
          onClick={() => setConfirmingDelivery(true)}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ceramic py-3 text-sm font-display text-white shadow-tile disabled:opacity-40"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
          Yetkazib berdim
        </button>
      )}

      {confirmingDelivery && (
        <DeliveryConfirmModal
          order={order}
          busy={busy}
          onConfirm={handleConfirmDelivered}
          onCancel={() => setConfirmingDelivery(false)}
        />
      )}
    </div>
  );
}
