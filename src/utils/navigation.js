/**
 * Qurilmadagi standart xarita ilovasida (Google Maps yoki brauzerda
 * mavjud boshqa xarita) berilgan koordinataga yo'nalish ochadi.
 * Google Maps universal "dir" URL ishlatiladi — bu Android/iOS'da
 * o'rnatilgan Google Maps ilovasini, bo'lmasa brauzerni ochadi.
 */
export function openNavigation(latitude, longitude, fallbackAddressText) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  let destination;
  if (lat && lng) {
    destination = `${lat},${lng}`;
  } else if (fallbackAddressText) {
    // Koordinata bo'lmasa (masalan, mijoz manzilni xaritadan belgilamagan),
    // manzil matnini destination sifatida yuboramiz — Google Maps buni ham
    // qidiradi, shunda navigatsiya tugmasi hech qachon "jim" qolmaydi.
    destination = encodeURIComponent(fallbackAddressText);
  } else {
    return false;
  }

  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
