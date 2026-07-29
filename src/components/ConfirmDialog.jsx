import { Loader2 } from "lucide-react";

/**
 * Oddiy tasdiqlash oynasi — naqd pulni oldingizmi yoki yetkazib berishni
 * yakunlashdan avval bosiladigan qo'shimcha tasdiqlar uchun ishlatiladi.
 */
export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Ha",
  cancelLabel = "Bekor qilish",
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm space-y-4 rounded-t-tile bg-paper p-5 shadow-card sm:rounded-tile"
      >
        <div className="space-y-1.5">
          <h3 className="font-display text-base text-ink">{title}</h3>
          {description && <p className="text-sm text-ink/60">{description}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-full border-2 border-ink/15 py-2.5 text-sm font-semibold text-ink/70 transition hover:border-ink/30 disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-2.5 text-sm font-display text-paper shadow-tile disabled:opacity-40"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
