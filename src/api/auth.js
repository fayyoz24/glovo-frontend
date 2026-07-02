import { api } from "./client";

// Telegram-only auth. The bot generates a one-time code and sends it to the
// user on Telegram; the site only ever verifies that code.
export const authApi = {
  verifyCode: (code) =>
    api.post("/auth/telegram/verify-code/", { code }, { auth: false }),
  me: () => api.get("/auth/me/"),
  updateProfile: (payload) => api.patch("/auth/me/", payload),
};
