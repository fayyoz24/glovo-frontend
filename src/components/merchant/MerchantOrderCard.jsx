import { useState } from "react";
import { Loader2, Check, X, ChefHat, PackageCheck, Wallet } from "lucide-react";
import { useMerchant } from "../../context/MerchantContext";
import { formatSum, formatDate, PAYMENT_METHOD_LABEL } from "../../utils/format";
import StatusBadge from "../StatusBadge";

export default function MerchantOrderCard({ order }) {
  const { acceptOrder, rejectOrder, startPreparing, markReady, busyId } = useMerchant();
  const [showReject, setShowReject] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const isBusy = busyId === order.id;

  const isNew = order.status === "pending";
  const isConfirmed = order.status === "merchant_confirmed";
  const isPreparing = order.status === "preparing";
  const isReady = order.status === "ready_for_pickup";

  return (
    <div className="space-y-3 rounded-tile border-2 border-ink/10 bg-white p-4 shadow-tile">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-base text-ink">#{order.public_id}</p>
          <p className="mt-0.5 text-xs text-ink/50">{formatDate(order.placed_at)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex items-center justify-between rounded-xl bg-paper p-3 text-sm">
        <span className="text-ink/60">{order.item_count} mahsulot</span>
        <span className="flex items-center gap-1.5 text-ink/60">
          <Wallet size={14} />
          {PAYMENT_METHOD_LABEL[order.payment_method] || order.payment_method}
        </span>
        <span className="font-display text-ceramic-dark">{formatSum(order.total_amount)}</span>
      </div>

      {order.items?.length > 0 && (
        <ul className="space-y-1.5 rounded-xl border-2 border-ink/10 bg-white p-3 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="font-semibold text-ink">{item.qty}×</span>{" "}
                <span className="text-ink">{item.product_name_snapshot}</span>
                {item.variant_snapshot && (
                  <span className="text-ink/50"> ({item.variant_snapshot})</span>
                )}
                {item.modifiers?.length > 0 && (
                  <p className="mt-0.5 text-xs text-ink/50">
                    {item.modifiers.map((m) => m.modifier_name).join(", ")}
                  </p>
                )}
                {item.instructions && (
                  <p className="mt-0.5 text-xs italic text-ink/60">"{item.instructions}"</p>
                )}
              </div>
              <span className="shrink-0 font-mono text-xs text-ink/50">{formatSum(item.line_total)}</span>
            </li>
          ))}
        </ul>
      )}

      {isNew && !showReject && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowReject(true)}
            disabled={isBusy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-pomegranate py-2.5 text-sm font-display text-pomegranate-dark disabled:opacity-40"
          >
            <X size={16} /> Rad etish
          </button>
          <button
            onClick={() => acceptOrder(order.id)}
            disabled={isBusy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ceramic py-2.5 text-sm font-display text-white shadow-tile disabled:opacity-40"
          >
            {isBusy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Qabul qilish
          </button>
        </div>
      )}

      {isNew && showReject && (
        <div className="space-y-2 rounded-xl border-2 border-pomegranate-light bg-pomegranate-light/40 p-3">
          <label className="block text-xs font-semibold text-pomegranate-dark">
            Rad etish sababi (ixtiyoriy)
          </label>
          <input
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Masalan: mahsulot tugagan"
            className="w-full rounded-lg border-2 border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-pomegranate"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowReject(false)}
              disabled={isBusy}
              className="flex-1 rounded-full border-2 border-ink/10 py-2 text-sm font-semibold text-ink/60"
            >
              Bekor qilish
            </button>
            <button
              onClick={() => rejectOrder(order.id, rejectNote)}
              disabled={isBusy}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-pomegranate py-2 text-sm font-display text-white disabled:opacity-40"
            >
              {isBusy ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
              Tasdiqlash
            </button>
          </div>
        </div>
      )}

      {isConfirmed && (
        <button
          onClick={() => startPreparing(order.id)}
          disabled={isBusy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-display text-paper shadow-tile disabled:opacity-40"
        >
          {isBusy ? <Loader2 size={16} className="animate-spin" /> : <ChefHat size={16} />}
          Tayyorlashni boshlash
        </button>
      )}

      {isPreparing && (
        <button
          onClick={() => markReady(order.id)}
          disabled={isBusy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-marigold py-3 text-sm font-display text-ink shadow-tile disabled:opacity-40 hover:bg-marigold-dark"
        >
          {isBusy ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
          Tayyor — kuryer kutmoqda
        </button>
      )}

      {isReady && (
        <p className="rounded-xl bg-ceramic-light px-3 py-2 text-center text-xs font-semibold text-ceramic-dark">
          Kuryer belgilanishi kutilmoqda…
        </p>
      )}
    </div>
  );
}
