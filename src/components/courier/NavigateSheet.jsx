import { useState } from "react";
import { MapPin, Navigation, X } from "lucide-react";

function buildGoogleMapsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

function buildYandexMapsUrl(lat, lng) {
  return `https://yandex.com/maps/?rtext=~${lat},${lng}&rtt=auto`;
}

/**
 * Buyurtma qabul qilingandan so'ng kuryer manzilga borish uchun
 * Google Maps yoki Yandex Maps ilovasini tanlashi mumkin bo'lgan tugma + action-sheet.
 *
 * order dan delivery_latitude / delivery_longitude / delivery_address maydonlari kutiladi
 * (backend: OrderListSerializer).
 */
export default function NavigateSheet({ order }) {
  const [open, setOpen] = useState(false);

  const lat = order?.delivery_latitude;
  const lng = order?.delivery_longitude;

  if (!lat || !lng) return null;

  const openApp = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink/15 bg-white py-3 text-sm font-semibold text-ink"
      >
        <Navigation size={16} className="text-ceramic-dark" />
        Manzilga borish
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-3 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-tile bg-white p-5 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg text-ink">Xarita ilovasini tanlang</h2>
              <button onClick={() => setOpen(false)} className="text-ink/40">
                <X size={20} />
              </button>
            </div>

            {order.delivery_address && (
              <p className="mb-4 flex items-start gap-2 rounded-xl bg-paper p-3 text-sm text-ink/70">
                <MapPin size={15} className="mt-0.5 shrink-0 text-ink/40" />
                {order.delivery_address}
              </p>
            )}

            <div className="space-y-2.5">
              <button
                onClick={() => openApp(buildGoogleMapsUrl(lat, lng))}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-display text-paper shadow-tile"
              >
                Google Maps
              </button>
              <button
                onClick={() => openApp(buildYandexMapsUrl(lat, lng))}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-ceramic py-3 text-sm font-display text-white shadow-tile"
              >
                Yandex Maps
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink/15 py-3 text-sm font-semibold text-ink/70"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
