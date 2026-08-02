import { useState } from "react";
import { Loader2, Navigation, PackageCheck, Store, Wallet, MapPin, Home } from "lucide-react";
import { useCourier } from "../../context/CourierContext";
import { useToast } from "../../context/ToastContext";
import { formatSum } from "../../utils/format";
import { openNavigation } from "../../utils/navigation";
import StatusBadge from "../StatusBadge";
import DeliveryConfirmModal from "./DeliveryConfirmModal";

export default function ActiveOrderCard({ order }) {
  const { markPickedUp, markDelivered, busy } = useCourier();
  const toast = useToast();
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);

  const handleNavigate = (lat, lng, fallbackText) => {
    const opened = openNavigation(lat, lng, fallbackText);
    if (!opened) {
      toast.error("Manzil koordinatalari topilmadi — navigatsiya ochilmadi");
    }
  };

  const isAssigned = order.status === "courier_assigned";
  const isOnTheWay = order.status === "picked_up" || order.status === "on_the_way";
  const items = order.items || [];

  const destAddress = order.address_snapshot;
  const destLat = destAddress?.latitude;
  const destLng = destAddress?.longitude;
  const destLine = typeof destAddress === "string" ? destAddress : destAddress?.address_line;

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

      {destLine && (
        <div className="flex items-start gap-2 rounded-xl bg-paper p-3 text-sm">
          <Home size={16} className="mt-0.5 shrink-0 text-ink/40" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
              Yetkazish manzili
            </p>
            <p className="truncate text-ink">{destLine}</p>
          </div>
        </div>
      )}

      {isAssigned && (
        <>
          <button
            type="button"
            onClick={() => handleNavigate(order.branch_lat, order.branch_lng, order.branch_address || order.branch_name)}
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink/15 py-3 text-sm font-semibold text-ink/70"
          >
            <Store size={16} /> Do'konga yo'nalish
          </button>
          <button
            onClick={() => markPickedUp(order.id)}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-display text-paper shadow-tile disabled:opacity-40"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
            Mahsulotni oldim
          </button>
        </>
      )}

      {isOnTheWay && (
        <>
          <button
            type="button"
            onClick={() => handleNavigate(destLat, destLng, destLine)}
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink/15 py-3 text-sm font-semibold text-ink/70"
          >
            <MapPin size={16} /> Yo'lga chiqdik — navigatsiya
          </button>
          <button
            onClick={() => setConfirmingDelivery(true)}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ceramic py-3 text-sm font-display text-white shadow-tile disabled:opacity-40"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
            {order.payment_method === "cash"
              ? `Yetkazib berdim (${formatSum(order.total_amount)} naqd oling)`
              : "Yetkazib berdim"}
          </button>
        </>
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
