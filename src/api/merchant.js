import { api } from "./client";

// Merchant paneli — do'kon xodimi (merchant_owner / merchant_manager) uchun
// buyurtmalarni boshqarish. Backend: apps.orders (merchant/*), apps.merchants.
export const merchantApi = {
  // Xodimning o'z profili — do'kon nomi va biriktirilgan filial
  profile: () => api.get("/merchant/profile/"),

  // Filialning buyurtma qabul qilish holatini almashtirish
  toggleAcceptingOrders: (accepting_orders) =>
    api.post("/merchant/branch/toggle-orders/", { accepting_orders }),

  // Buyurtmalar ro'yxati (ixtiyoriy status filtri bilan)
  orders: (status) => api.get("/merchant/orders/", status ? { status } : undefined),

  // Amallar
  confirmOrder: (orderId, note) => api.post(`/merchant/orders/${orderId}/confirm/`, { note }),
  rejectOrder: (orderId, note) => api.post(`/merchant/orders/${orderId}/reject/`, { note }),
  startPreparing: (orderId, note) => api.post(`/merchant/orders/${orderId}/preparing/`, { note }),
  markReady: (orderId, note) => api.post(`/merchant/orders/${orderId}/ready/`, { note }),
};
