import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, XCircle, Star } from "lucide-react";
import { ordersApi } from "../api/orders";
import StatusBadge from "../components/StatusBadge";
import OrderTimeline from "../components/OrderTimeline";
import ReviewForm from "../components/ReviewForm";
import { useToast } from "../context/ToastContext";
import {
  formatSum,
  formatDate,
  CANCELLABLE_STATUSES,
  PAYMENT_METHOD_LABEL,
} from "../utils/format";

const ACTIVE_STATUSES = [
  "pending",
  "merchant_confirmed",
  "preparing",
  "ready_for_pickup",
  "courier_assigned",
  "picked_up",
  "on_the_way",
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const load = useCallback(() => {
    return ordersApi
      .detail(id)
      .then(setOrder)
      .catch(() => navigate("/orders", { replace: true }));
  }, [id, navigate]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (!order || !ACTIVE_STATUSES.includes(order.status)) return;
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [order, load]);

  const cancelOrder = async () => {
    setCancelling(true);
    try {
      const updated = await ordersApi.cancel(id, "customer_request", "");
      setOrder(updated);
      toast.success("Buyurtma bekor qilindi");
    } catch (e) {
      toast.error(e.message || "Bekor qilib bo'lmadi");
    } finally {
      setCancelling(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="animate-spin text-ink/40" size={26} />
      </div>
    );
  }

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  return (
    <div className="space-y-5 pb-6">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl text-ink">{order.merchant_name}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-0.5 font-mono text-sm text-ink/50">
          #{order.public_id} · {formatDate(order.placed_at)}
        </p>
      </div>

      <section className="rounded-tile border-2 border-ink/10 bg-white p-4">
        <OrderTimeline status={order.status} />
      </section>

      <section className="space-y-2 rounded-tile border-2 border-ink/10 bg-white p-4">
        <h2 className="mb-1 font-body text-sm font-bold text-ink">Mahsulotlar</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
            <span className="text-ink/70">
              {item.qty} × {item.product_name_snapshot}
              {item.variant_snapshot && (
                <span className="text-ink/40"> ({item.variant_snapshot})</span>
              )}
            </span>
            <span className="shrink-0 font-mono text-ink">{formatSum(item.line_total)}</span>
          </div>
        ))}
        <div className="my-1 border-t-2 border-dashed border-ink/10" />
        <Row label="Mahsulotlar" value={order.subtotal} />
        {Number(order.discount_amount) > 0 && (
          <Row label="Chegirma" value={-order.discount_amount} highlight="text-pomegranate" />
        )}
        <Row label="Yetkazib berish" value={order.delivery_fee} />
        {Number(order.tip_amount) > 0 && <Row label="Choy puli" value={order.tip_amount} />}
        <Row label="Jami" value={order.total_amount} bold />
      </section>

      <section className="rounded-tile border-2 border-ink/10 bg-white p-4 text-sm">
        <h2 className="mb-2 font-body text-sm font-bold text-ink">To'lov va manzil</h2>
        <p className="text-ink/70">
          To'lov: <span className="font-semibold text-ink">{PAYMENT_METHOD_LABEL[order.payment_method]}</span>
        </p>
        {order.address_snapshot && (
          <p className="mt-1 text-ink/70">
            Manzil:{" "}
            <span className="font-semibold text-ink">
              {typeof order.address_snapshot === "string"
                ? order.address_snapshot
                : order.address_snapshot.address_line}
            </span>
          </p>
        )}
      </section>

      {order.status === "cancelled" && order.cancel_reason && (
        <section className="rounded-tile border-2 border-pomegranate-light bg-pomegranate-light p-4 text-sm text-pomegranate-dark">
          Bekor qilingan sabab: {order.cancel_reason}
          {order.cancel_note && ` — ${order.cancel_note}`}
        </section>
      )}

      {canCancel && (
        <button
          onClick={cancelOrder}
          disabled={cancelling}
          className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-pomegranate py-3 font-display text-sm text-pomegranate transition hover:bg-pomegranate hover:text-white disabled:opacity-40"
        >
          {cancelling ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
          Buyurtmani bekor qilish
        </button>
      )}

      {order.status === "delivered" && !showReview && (
        <button
          onClick={() => setShowReview(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-marigold py-3 font-display text-sm text-ink shadow-tile transition hover:bg-marigold-dark"
        >
          <Star size={16} /> Buyurtmani baholash
        </button>
      )}

      {showReview && <ReviewForm orderId={order.id} onDone={() => setShowReview(false)} />}
    </div>
  );
}

function Row({ label, value, bold, highlight }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-bold text-ink" : "text-ink/70"}`}>
      <span>{label}</span>
      <span className={`font-mono ${highlight || ""}`}>{formatSum(value)}</span>
    </div>
  );
}
