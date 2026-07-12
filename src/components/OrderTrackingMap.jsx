import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Bike, Store, Home } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

function divIcon(Icon, bgClassName, size = 34) {
  const html = renderToStaticMarkup(
    <div
      className={`grid place-items-center rounded-full border-2 border-white text-white shadow-tile ${bgClassName}`}
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.52)} strokeWidth={2.5} />
    </div>
  );
  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const branchIcon = divIcon(Store, "bg-ceramic");
const destinationIcon = divIcon(Home, "bg-pomegranate");
const courierIcon = divIcon(Bike, "bg-marigold-dark", 38);

/**
 * Buyurtmani jonli kuzatish xaritasi.
 * props:
 *  - branch: { lat, lng } | null — do'kon/filial nuqtasi
 *  - destination: { lat, lng } | null — yetkazish manzili
 *  - courier: { lat, lng } | null — kuryerning joriy joylashuvi (real-time yangilanadi)
 */
export default function OrderTrackingMap({ branch, destination, courier }) {
  const points = [branch, destination, courier].filter((p) => p && p.lat && p.lng);
  const initialCenter = points[0] || { lat: 41.311081, lng: 69.240562 };

  const routeLine = useMemo(() => {
    const pts = [];
    if (branch) pts.push([branch.lat, branch.lng]);
    if (courier) pts.push([courier.lat, courier.lng]);
    if (destination) pts.push([destination.lat, destination.lng]);
    return pts.length >= 2 ? pts : null;
  }, [branch, destination, courier]);

  if (points.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-tile border-2 border-ink/10">
      <MapContainer
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "220px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {branch && <Marker position={[branch.lat, branch.lng]} icon={branchIcon} />}
        {destination && <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />}
        {courier && <AnimatedCourierMarker position={courier} />}
        {routeLine && (
          <Polyline positions={routeLine} pathOptions={{ color: "#C97F00", weight: 3, dashArray: "6 8" }} />
        )}
        <FitToPoints points={points} />
      </MapContainer>
    </div>
  );
}

function AnimatedCourierMarker({ position }) {
  const markerRef = useRef(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    marker.setLatLng([position.lat, position.lng]);
  }, [position.lat, position.lng]);

  return (
    <Marker
      ref={markerRef}
      position={[position.lat, position.lng]}
      icon={courierIcon}
      zIndexOffset={1000}
    />
  );
}

function FitToPoints({ points }) {
  const map = useMap();
  const boundsKey = points.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join("|");

  useEffect(() => {
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 15);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 16 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundsKey]);

  return null;
}
