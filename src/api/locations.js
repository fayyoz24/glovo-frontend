import { api } from "./client";

export const locationsApi = {
  listAddresses: () => api.get("/addresses/"),
  createAddress: (payload) => api.post("/addresses/", payload),
  updateAddress: (id, payload) => api.patch(`/addresses/${id}/`, payload),
  deleteAddress: (id) => api.delete(`/addresses/${id}/`),
  setDefault: (id) => api.post(`/addresses/${id}/set-default/`),
  zones: (city) => api.get("/zones/", { city }),
};
