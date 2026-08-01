import { Minus, Plus, Loader2, Undo2 } from "lucide-react";
import { formatQty } from "../utils/format";

/**
 * qty ni +/- qilish uchun stepper. Dona mahsulotlar uchun qadam har doim 1,
 * kg bilan sotiladigan mahsulotlar uchun `step` prop orqali 0.1 yoki 0.5 kg
 * qadam beriladi (Product.qty_step backenddan keladi — kg narxi 100 000 so'mdan
 * qimmat bo'lsa 0.1, aks holda 0.5).
 *
 * `onUndo` berilsa va `canUndo` true bo'lsa, oxirgi bosilgan +/- amalini
 * (bitta qadamni) bekor qiladigan "orqaga qaytarish" tugmasi chiqadi —
 * masalan foydalanuvchi +1 kg bosib, keyin fikrini o'zgartirsa, aynan o'sha
 * bosishni ortga qaytaradi (joriy tanlangan qadamdan qat'i nazar).
 */
export default function QuantityStepper({
  qty,
  onDecrease,
  onIncrease,
  onUndo,
  canUndo = false,
  busy,
  min = 0,
  max = 50,
  step = 1,
  unitType = "piece",
}) {
  const stepNum = Number(step) || 1;
  const belowMin = Number(qty) <= (min || stepNum) + 1e-9;
  const aboveMax = Number(qty) >= max - 1e-9;

  return (
    <div className="inline-flex items-center gap-2">
      {onUndo && (
        <button
          type="button"
          onClick={onUndo}
          disabled={busy || !canUndo}
          aria-label="Orqaga qaytarish"
          title="Oxirgi bosishni bekor qilish"
          className="grid h-7 w-7 place-items-center rounded-full border-2 border-ink/15 text-ink/50 transition hover:border-ink/30 hover:text-ink disabled:opacity-25"
        >
          <Undo2 size={14} />
        </button>
      )}
      <div className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-paper p-1">
        <button
          type="button"
          onClick={onDecrease}
          disabled={busy || belowMin}
          aria-label="Kamaytirish"
          className="grid h-7 w-7 place-items-center rounded-full bg-ink text-paper transition disabled:opacity-30"
        >
          <Minus size={14} />
        </button>
        <span className="min-w-[2.25rem] text-center font-mono text-sm font-semibold tabular-nums">
          {busy ? <Loader2 size={14} className="mx-auto animate-spin" /> : formatQty(qty, unitType)}
        </span>
        <button
          type="button"
          onClick={onIncrease}
          disabled={busy || aboveMax}
          aria-label="Ko'paytirish"
          className="grid h-7 w-7 place-items-center rounded-full bg-marigold text-ink transition disabled:opacity-30"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

/**
 * Kg bilan sotiladigan mahsulotlar uchun qadam tanlash tugmalari: +1, +0.5, +0.1 kg.
 * Mavjud qadamlar product.qty_increments dan keladi (narxga qarab backend belgilaydi).
 */
export function QtyIncrementPicker({ increments = [1], activeStep, onSelect, disabled }) {
  if (!increments || increments.length <= 1) return null;
  return (
    <div className="flex items-center gap-1.5">
      {increments.map((inc) => (
        <button
          key={inc}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(inc)}
          className={`rounded-full border-2 px-2.5 py-1 text-xs font-semibold transition disabled:opacity-40 ${
            Number(activeStep) === Number(inc)
              ? "border-ink bg-ink text-paper"
              : "border-ink/15 bg-white text-ink/60 hover:border-ink/30"
          }`}
        >
          +{inc} kg
        </button>
      ))}
    </div>
  );
}
