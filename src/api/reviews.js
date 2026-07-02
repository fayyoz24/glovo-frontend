import { api } from "./client";

export const reviewsApi = {
  create: (orderId, payload) => api.post(`/orders/${orderId}/review/`, payload),
  mine: () => api.get("/reviews/my/"),
  update: (reviewId, payload) => api.patch(`/reviews/${reviewId}/`, payload),
  flag: (reviewId, reason) => api.post(`/reviews/${reviewId}/flag/`, { reason }),
  merchantReviews: (merchantId, page) =>
    api.get(`/merchants/${merchantId}/reviews/`, { page }, { auth: false }),
  merchantRatingStats: (merchantId) =>
    api.get(`/merchants/${merchantId}/rating-stats/`, undefined, { auth: false }),
};
