import { Loader2, Power } from "lucide-react";
import { useCourier } from "../../context/CourierContext";

export default function OnlineToggle() {
  const { isOnline, busy, goOnline, goOffline, socketConnected } = useCourier();

  return (
    <div
      className={`flex items-center justify-between rounded-tile border-2 p-4 shadow-tile transition ${
        isOnline ? "border-ceramic bg-ceramic text-white" : "border-ink/10 bg-white text-ink"
      }`}
    >
      <div>
        <p className="font-display text-lg">{isOnline ? "Onlaynsiz" : "Oflaynsiz"}</p>
        <p className={`text-xs ${isOnline ? "text-white/75" : "text-ink/50"}`}>
          {isOnline
            ? socketConnected
              ? "Buyurtma takliflarini kutmoqdasiz"
              : "Ulanish tiklanmoqda…"
            : "Buyurtma olish uchun onlayn bo'ling"}
        </p>
      </div>

      <button
        onClick={isOnline ? goOffline : goOnline}
        disabled={busy}
        className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-display shadow-tile transition disabled:opacity-50 ${
          isOnline ? "bg-white text-ceramic-dark" : "bg-marigold text-ink hover:bg-marigold-dark"
        }`}
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
        {isOnline ? "Tugatish" : "Boshlash"}
      </button>
    </div>
  );
}
