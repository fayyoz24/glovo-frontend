import { useState } from "react";
import { Loader2, Navigation, PackageCheck, Store, MapPin } from "lucide-react";
import { useCourier } from "../../context/CourierContext";
import { formatSum } from "../../utils/format";
import StatusBadge from "../StatusBadge";
import ConfirmDialog from "../ConfirmDialog";

export default function ActiveOrderCard({ order }) {
  const { markPickedUp, markDelivered, busy } = useCourier();
  // dialog bosqichi: null -> "cash" (naqd pul tasdig'i) -> "final" (yakuniy tasdiq)
  const [deliveryStep, setDeliveryStep] = useState(null);

  const isAssigned = order.status === "courier_assigned";
  const isOnTheWay = order.status === "picked_up" || order.status === "on_the_way";
  const isCash = order.payment_method === "cash";

  const address = order.address_snapshot || {};
  const items = order.items || [];

  const openNavigation = () => {
    const lat = address.latitude;
    const lng = address.longitude;
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    } else if (address.address_line) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address.address_line)}`,
        "_blank"
      );
    }
  };

  const startDeliveryConfirmation = () => {
    setDeliveryStep(isCash ? "cash" : "final");
  };

  const confirmCashCollected = () => {
    setDeliveryStep("final");
  };

  const confirmFinalDelivery = async () => {
    await markDelivered(order.id);
    setDeliveryStep(null);
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

      {isAssigned ? (
        // Kuryer hali mahsulotni olmagan — do'kondan qaysi mahsulotlarni
        // olib ketish kerakligini aniq ko'rsatamiz.
        <div className="space-y-1.5 rounded-xl bg-paper p-3 text-sm">
          {items.length ? (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-ink/80">
                  <span className="font-semibold text-ink">{item.qty}x</span>{" "}
                  {item.product_name_snapshot}
                  {item.variant_snapshot ? ` (${item.variant_snapshot})` : ""}
                </span>
              </div>
            ))
          ) : (
            <span className="text-ink/60">{order.item_count ?? items.length} mahsulot</span>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl bg-paper p-3 text-sm">
          <span className="flex items-center gap-1.5 text-ink/60">
            <MapPin size={14} /> {address.address_line || `${items.length} mahsulot`}
          </span>
          <span className="font-display text-ceramic-dark">{formatSum(order.total_amount)}</span>
        </div>
      )}

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
        <div className="space-y-2">
          <button
            onClick={openNavigation}
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink/15 py-3 text-sm font-display text-ink transition hover:border-ink/30"
          >
            <Navigation size={16} />
            Manzilga yo'nalish
          </button>

          <button
            onClick={startDeliveryConfirmation}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ceramic py-3 text-sm font-display text-white shadow-tile disabled:opacity-40"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
            Yetkazib berdim
          </button>
        </div>
      )}

      {deliveryStep === "cash" && (
        <ConfirmDialog
          title="Naqd pulni oldingizmi?"
          description={`Mijozdan ${formatSum(order.total_amount)} summasini qabul qilib oldingizmi?`}
          confirmLabel="Ha, oldim"
          cancelLabel="Hali emas"
          onConfirm={confirmCashCollected}
          onCancel={() => setDeliveryStep(null)}
        />
      )}

      {deliveryStep === "final" && (
        <ConfirmDialog
          title="Buyurtmani yakunlaysizmi?"
          description="Bu amalni ortga qaytarib bo'lmaydi. Buyurtma yetkazib berilgan deb belgilanadi."
          confirmLabel="Ha, yakunlash"
          cancelLabel="Bekor qilish"
          busy={busy}
          onConfirm={confirmFinalDelivery}
          onCancel={() => setDeliveryStep(null)}
        />
      )}
    </div>
  );
}
