import { api } from "./client";

export const promotionsApi = {
  validate: (code, subtotal, merchantId) =>
    api.post("/validate/", { code, subtotal, merchant_id: merchantId }),
  myReferralCode: () => api.get("/referral/"),
};
