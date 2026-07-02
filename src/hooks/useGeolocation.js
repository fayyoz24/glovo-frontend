import { useCallback, useState } from "react";

const TASHKENT_FALLBACK = { lat: 41.311081, lng: 69.240562 };

export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | locating | granted | denied

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setCoords(TASHKENT_FALLBACK);
      setStatus("denied");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("granted");
      },
      () => {
        setCoords(TASHKENT_FALLBACK);
        setStatus("denied");
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  return { coords, status, request, fallback: TASHKENT_FALLBACK };
}
