import { Loader2, Wallet, Check, X } from "lucide-react";
import { formatSum } from "../../utils/format";

export default function DeliveryConfirmModal({ order, busy, onConfirm, onCancel }) {
  const isCash = order.payment_method === "cash";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-3 sm:items-center">
      <div className="w-full max-w-sm rounded-tile bg-white p-5 shadow-card">
        {isCash ? (
          <>
            <div className="mb-3 flex items-center gap-2">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-marigold-light text-marigold-dark">
                <Wallet size={18} />
              </div>
              <h2 className="font-display text-lg text-ink">Naqd pulni tekshiring</h2>
            </div>
            <p className="text-sm text-ink/70">
              Mijozdan{" "}
              <span className="font-display text-ceramic-dark">
                {formatSum(order.total_amount)}
              </span>{" "}
              naqd pul oldingizmi? Yetkazib berishni faqat pulni to'liq olganingizdan keyin
              tasdiqlang.
            </p>
          </>
        ) : (
          <>
            <h2 className="mb-3 font-display text-lg text-ink">Yetkazib berishni tasdiqlash</h2>
            <p className="text-sm text-ink/70">
              #{order.public_id} raqamli buyurtmani mijozga topshirdingizmi?
            </p>
          </>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-ink/15 py-3 text-sm font-semibold text-ink/70 disabled:opacity-40"
          >
            <X size={16} /> Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ceramic py-3 text-sm font-display text-white shadow-tile disabled:opacity-40"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {isCash ? "Ha, pulni oldim" : "Ha, topshirdim"}
          </button>
        </div>
      </div>
    </div>
  );
}
