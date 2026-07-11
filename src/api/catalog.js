import { api } from "./client";

export const catalogApi = {
  // merchant berilsa, backend shu do'konning turiga (merchant_type) mos kategoriyalarni qaytaradi
  categories: (parent, { merchant, merchantType } = {}) =>
    api.get(
      "/categories/",
      { parent, merchant, merchant_type: merchantType },
      { auth: false }
    ),
  branchProducts: (merchantId, { branch, category, q, page } = {}) =>
    api.get(
      `/merchants/${merchantId}/products/`,
      { branch, category, q, page },
      { auth: false }
    ),
  productDetail: (id) => api.get(`/products/${id}/`, undefined, { auth: false }),
  search: (q, merchant) =>
    api.get("/search/", { q, merchant }, { auth: false }),
};
