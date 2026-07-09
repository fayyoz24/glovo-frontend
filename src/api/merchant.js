import { api } from "./client";

// Merchant paneli — do'kon xodimi (merchant_owner / merchant_manager) uchun
// buyurtmalarni boshqarish. Backend: apps.orders (merchant/*), apps.merchants.
export const merchantApi = {
  // Ro'yxatdan o'tish — istalgan login qilgan foydalanuvchi o'z do'koni uchun ariza topshiradi
  register: ({ name, type, description }) =>
    api.post("/merchant/register/", { name, type, description }),

  // Foydalanuvchi topshirgan barcha do'kon arizalari va ularning holati
  applications: () => api.get("/merchant/applications/"),

  // Xodimning o'z profili — do'kon nomi va biriktirilgan filial
  profile: () => api.get("/merchant/profile/"),

  // Do'konimning to'liq ma'lumoti / tahrirlash
  getMine: () => api.get("/merchant/mine/"),
  updateMine: (payload) => api.patch("/merchant/mine/", payload),

  // Filialim — yaratish (birinchi marta) va tahrirlash
  createBranch: (payload) => api.post("/merchant/branch/", payload),
  updateBranch: (payload) => api.patch("/merchant/branch/", payload),

  // Ko'p filialli boshqaruv
  branches: () => api.get("/merchant/branches/"),
  addBranch: (payload) => api.post("/merchant/branches/", payload),
  updateBranchById: (branchId, payload) => api.patch(`/merchant/branches/${branchId}/`, payload),
  switchBranch: (branchId) => api.post(`/merchant/branches/${branchId}/switch/`),

  // Filialning buyurtma qabul qilish holatini almashtirish
  toggleAcceptingOrders: (accepting_orders) =>
    api.post("/merchant/branch/toggle-orders/", { accepting_orders }),

  // Mahsulotlar
  categories: () => api.get("/categories/", undefined, { auth: false }),
  products: (q) => api.get("/merchant/products/", q ? { q } : undefined),
  createProduct: (payload) => api.post("/merchant/products/create/", payload),
  updateProduct: (productId, payload) => api.patch(`/merchant/products/${productId}/`, payload),
  toggleProductAvailability: (productId, is_available) =>
    api.post(`/merchant/products/${productId}/toggle-availability/`, { is_available }),

  // Buyurtmalar ro'yxati (ixtiyoriy status filtri bilan)
  orders: (status) => api.get("/merchant/orders/", status ? { status } : undefined),

  // Amallar
  confirmOrder: (orderId, note) => api.post(`/merchant/orders/${orderId}/confirm/`, { note }),
  rejectOrder: (orderId, note) => api.post(`/merchant/orders/${orderId}/reject/`, { note }),
  startPreparing: (orderId, note) => api.post(`/merchant/orders/${orderId}/preparing/`, { note }),
  markReady: (orderId, note) => api.post(`/merchant/orders/${orderId}/ready/`, { note }),
};
