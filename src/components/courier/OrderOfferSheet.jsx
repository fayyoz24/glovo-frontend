import { useEffect, useState } from "react";
import { MapPin, Store, Wallet, Package, Loader2, X, Check } from "lucide-react";
import { useCourier } from "../../context/CourierContext";
import { formatSum } from "../../utils/format";

export default function OrderOfferSheet() {
  const { offer, acceptOffer, rejectOffer, busy } = useCourier();
  const [secondsLeft, setSecondsLeft] = useState(offer?.expires_in_seconds ?? 30);

  useEffect(() => {
    setSecondsLeft(offer?.expires_in_seconds ?? 30);
  }, [offer?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!offer) return;
    if (secondsLeft <= 0) {
      rejectOffer();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [offer, secondsLeft, rejectOffer]);

  if (!offer) return null;

  const total = offer.expires_in_seconds || 30;
  const progress = Math.max(0, Math.min(100, (secondsLeft / total) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-3 sm:items-center">
      <div className="w-full max-w-sm rounded-tile bg-white p-5 shadow-card">
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-marigold transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">Yangi buyurtma</h2>
          <span className="font-mono text-sm font-bold text-pomegranate">{secondsLeft}s</span>
        </div>

        <div className="space-y-3 rounded-xl bg-paper p-4 text-sm">
          <Row icon={Store} label={offer.merchant_name} sub={offer.branch_address} />
          <Row icon={MapPin} label="Yetkazish manzili" sub={offer.delivery_address} />
          <div className="flex items-center justify-between border-t border-ink/10 pt-3">
            <span className="flex items-center gap-1.5 text-ink/60">
              <Package size={15} /> {offer.item_count} mahsulot
            </span>
            <span className="flex items-center gap-1.5 font-display text-ceramic-dark">
              <Wallet size={15} /> {formatSum(offer.total_amount)}
            </span>
          </div>
          {offer.distance_km != null && (
            <p className="text-xs text-ink/50">Masofa: ~{offer.distance_km} km</p>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={rejectOffer}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-ink/15 py-3 text-sm font-semibold text-ink/70 disabled:opacity-40"
          >
            <X size={16} /> Rad etish
          </button>
          <button
            onClick={acceptOffer}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ceramic py-3 text-sm font-display text-white shadow-tile disabled:opacity-40"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Qabul qilish
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, sub }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={16} className="mt-0.5 shrink-0 text-ink/40" />
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink">{label}</p>
        {sub && <p className="truncate text-xs text-ink/50">{sub}</p>}
      </div>
    </div>
  );
}
