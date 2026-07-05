import { api } from "./client";

export const cartApi = {
  get: () => api.get("/cart/"),
  clear: () => api.post("/cart/clear/"),
  addItem: ({ product_id, qty = 1, variant_id, modifier_option_ids = [], instructions = "" }) =>
    api.post("/cart/items/", { product_id, qty, variant_id, modifier_option_ids, instructions }),
  updateItem: (itemId, qty) => api.patch(`/cart/items/${itemId}/`, { qty }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}/delete/`),
  applyPromo: (code) => api.post("/cart/apply-promo/", { code }),
};
