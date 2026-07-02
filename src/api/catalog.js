import { api } from "./client";

export const catalogApi = {
  categories: (parent) =>
    api.get("/categories/", { parent }, { auth: false }),
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
