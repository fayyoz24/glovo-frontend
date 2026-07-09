import { useCallback, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, MapPin } from "lucide-react";
import { useGeolocation } from "../hooks/useGeolocation";

// Vite + Leaflet: standart marker rasm yo'llari build paytida buzilib qoladi,
// shuning uchun ikonkani CDN'dan aniq URL bilan qayta belgilaymiz.
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const TASHKENT_CENTER = { lat: 41.311081, lng: 69.240562 };

/**
 * Xaritadan nuqta tanlash komponenti.
 * props:
 *  - value: { lat, lng } | null
 *  - onChange: (coords: { lat, lng }) => void
 */
export default function LocationMapPicker({ value, onChange }) {
  const [center] = useState(value || TASHKENT_CENTER);
  const { coords, status, request } = useGeolocation();

  // Foydalanuvchi "joriy joylashuvim" tugmasini bosganda aniqlangan koordinata
  // tanlangan nuqta sifatida o'rnatiladi.
  useEffect(() => {
    if (coords && status === "granted") {
      onChange(coords);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, status]);

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border-2 border-ink/10">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: "260px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={onChange} />
          {value && <DraggableMarker position={value} onChange={onChange} />}
          <FlyToOnChange target={coords} />
        </MapContainer>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={request}
          className="flex items-center gap-1.5 text-xs font-semibold text-ceramic-dark"
        >
          <LocateFixed size={14} />
          {status === "locating" ? "Aniqlanmoqda..." : "Joriy joylashuvimni ishlatish"}
        </button>
        {value && (
          <span className="flex items-center gap-1 text-xs text-ink/50">
            <MapPin size={12} />
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </span>
        )}
      </div>
      {!value && <p className="text-xs text-ink/40">Xaritada filial joylashgan nuqtani bosing.</p>}
    </div>
  );
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) });
    },
  });
  return null;
}

function DraggableMarker({ position, onChange }) {
  const handleDragEnd = useCallback(
    (e) => {
      const marker = e.target;
      const pos = marker.getLatLng();
      onChange({ lat: Number(pos.lat.toFixed(6)), lng: Number(pos.lng.toFixed(6)) });
    },
    [onChange]
  );

  return (
    <Marker
      position={[position.lat, position.lng]}
      draggable
      icon={markerIcon}
      eventHandlers={{ dragend: handleDragEnd }}
    />
  );
}

function FlyToOnChange({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.lat, target?.lng]);
  return null;
}
