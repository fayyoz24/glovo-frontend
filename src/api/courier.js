import { api } from "./client";

// Kuryer profili, smena va daromad — apps.couriers
export const courierApi = {
  profile: () => api.get("/courier/profile/"),
  updateProfile: (payload) => api.patch("/courier/profile/", payload),

  goOnline: () => api.post("/courier/go-online/"),
  goOffline: () => api.post("/courier/go-offline/"),

  locationPing: ({ latitude, longitude, accuracy }) =>
    api.post("/courier/location-ping/", { latitude, longitude, accuracy }),

  activeOrders: () => api.get("/courier/orders/"),

  earnings: (days = 30) => api.get("/courier/earnings/", { days }),

  shift: () => api.get("/courier/shift/"),

  // Buyurtma taklifi va yetkazib berish oqimi — apps.dispatch
  availableOrders: () => api.get("/courier/orders/available/"),
  acceptOrder: (assignmentId) => api.post(`/courier/orders/${assignmentId}/accept/`),
  rejectOrder: (assignmentId) => api.post(`/courier/orders/${assignmentId}/reject/`),
  markPickedUp: (orderId) => api.post(`/courier/orders/${orderId}/picked-up/`),
  markDelivered: (orderId) => api.post(`/courier/orders/${orderId}/delivered/`),
  assignmentHistory: () => api.get("/courier/assignments/"),
};
