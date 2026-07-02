import { api } from "./client";

// NOTE: config/urls.py in the provided backend mounts apps.notifications.urls
// without an "notifications/" prefix, which conflicts with the routes
// documented in INTEGRATION.md. This client follows the documented,
// intended paths (/api/v1/notifications/...) — adjust API_BASE_URL routing
// on the backend side, or edit the paths below, if your deployment differs.
export const notificationsApi = {
  list: () => api.get("/notifications/"),
  unreadCount: () => api.get("/notifications/unread-count/"),
  markRead: (id) => api.post("/notifications/mark-read/", { notification_id: id }),
  markAllRead: () => api.post("/notifications/mark-all-read/"),
};
