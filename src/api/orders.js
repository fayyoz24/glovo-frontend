import { api } from "./client";

export const ordersApi = {
  checkout: ({ address_id, payment_method, tip_amount = 0 }) =>
    api.post("/orders/checkout/", { address_id, payment_method, tip_amount }),
  list: (status) => api.get("/orders/", { status }),
  detail: (id) => api.get(`/orders/${id}/`),
  cancel: (id, reason, note) => api.post(`/orders/${id}/cancel/`, { reason, note }),
  track: (id) => api.get(`/orders/${id}/track/`),
};
