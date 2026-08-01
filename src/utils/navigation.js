/**
 * Qurilmadagi standart xarita ilovasida (Google Maps yoki brauzerda
 * mavjud boshqa xarita) berilgan koordinataga yo'nalish ochadi.
 * Google Maps universal "dir" URL ishlatiladi — bu Android/iOS'da
 * o'rnatilgan Google Maps ilovasini, bo'lmasa brauzerni ochadi.
 */
export function openNavigation(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!lat || !lng) return false;

  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
