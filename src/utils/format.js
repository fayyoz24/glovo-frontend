export function formatSum(value) {
  const n = Number(value ?? 0);
  return `${n.toLocaleString("ru-RU").replace(/,/g, " ")} so'm`;
}

export function formatQty(qty, unitType = "piece") {
  const n = Number(qty ?? 0);
  if (unitType === "kg") {
    // Ortiqcha nollarni olib tashlaymiz: 1.50 -> 1.5, 2.00 -> 2
    const trimmed = n.toFixed(2).replace(/\.?0+$/, "");
    return `${trimmed} kg`;
  }
  return `${n}`;
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ORDER_STATUS_LABEL = {
  pending: "Kutilmoqda",
  merchant_confirmed: "Do'kon tasdiqladi",
  preparing: "Tayyorlanmoqda",
  ready_for_pickup: "Kuryer uchun tayyor",
  courier_assigned: "Kuryer belgilandi",
  picked_up: "Kuryer oldi",
  on_the_way: "Yo'lda",
  delivered: "Yetkazib berildi",
  cancelled: "Bekor qilindi",
};

export const ORDER_STATUS_STEPS = [
  "pending",
  "merchant_confirmed",
  "preparing",
  "ready_for_pickup",
  "courier_assigned",
  "picked_up",
  "on_the_way",
  "delivered",
];

export const CANCELLABLE_STATUSES = ["pending", "merchant_confirmed", "preparing"];

export const PAYMENT_METHOD_LABEL = {
  cash: "Naqd pul",
  click: "Click",
  payme: "Payme",
  uzcard: "Uzcard",
};

export const CANCEL_REASON_LABEL = {
  customer_request: "Fikrimni o'zgartirdim",
  payment_failed: "To'lov muvaffaqiyatsiz bo'ldi",
  other: "Boshqa sabab",
};
