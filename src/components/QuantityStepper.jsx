import { Minus, Plus, Loader2 } from "lucide-react";

export default function QuantityStepper({ qty, onDecrease, onIncrease, busy, min = 1, max = 50 }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-paper p-1">
      <button
        type="button"
        onClick={onDecrease}
        disabled={busy || qty <= min}
        aria-label="Kamaytirish"
        className="grid h-7 w-7 place-items-center rounded-full bg-ink text-paper transition disabled:opacity-30"
      >
        <Minus size={14} />
      </button>
      <span className="w-6 text-center font-mono text-sm font-semibold tabular-nums">
        {busy ? <Loader2 size={14} className="mx-auto animate-spin" /> : qty}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={busy || qty >= max}
        aria-label="Ko'paytirish"
        className="grid h-7 w-7 place-items-center rounded-full bg-marigold text-ink transition disabled:opacity-30"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
