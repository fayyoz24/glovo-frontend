import { api } from "./client";

export const merchantsApi = {
  list: (params) => api.get("/merchants/", params, { auth: false }),
  nearby: (lat, lng) => api.get("/merchants/nearby/", { lat, lng }),
  detail: (id) => api.get(`/merchants/${id}/`, undefined, { auth: false }),
  branches: (merchantId) =>
    api.get(`/merchants/${merchantId}/branches/`, undefined, { auth: false }),
};
