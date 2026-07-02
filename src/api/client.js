import { tokenStore } from "./tokenStore";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

let refreshPromise = null;

async function refreshAccessToken() {
  const refresh = tokenStore.getRefresh();
  if (!refresh) throw new ApiError("Sessiya topilmadi", { status: 401 });

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })
      .then(async (res) => {
        if (!res.ok) throw new ApiError("Sessiya muddati tugagan", { status: res.status });
        const data = await res.json();
        tokenStore.setTokens({ access: data.access, refresh: data.refresh });
        return data.access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function extractMessage(data) {
  if (!data) return "Xatolik yuz berdi";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  // DRF validation errors: { field: ["msg"] }
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    const msg = Array.isArray(val) ? val[0] : val;
    return typeof msg === "string" ? msg : "Xatolik yuz berdi";
  }
  return "Xatolik yuz berdi";
}

/**
 * request() — thin fetch wrapper.
 * @param {string} path - path starting with "/" appended to API_BASE_URL
 * @param {object} opts - { method, body, auth, params, isRetry }
 */
export async function request(path, opts = {}) {
  const { method = "GET", body, auth = true, params, isRetry = false } = opts;

  let url = `${API_BASE_URL}${path}`;
  if (params && Object.keys(params).length) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const access = tokenStore.getAccess();
    if (access) headers.Authorization = `Bearer ${access}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError("Serverga ulanib bo'lmadi. Internetni tekshiring.", { status: 0 });
  }

  if (res.status === 401 && auth && !isRetry && tokenStore.getRefresh()) {
    try {
      await refreshAccessToken();
      return request(path, { ...opts, isRetry: true });
    } catch {
      tokenStore.clear();
      window.dispatchEvent(new CustomEvent("dasturxon:logout"));
      throw new ApiError("Sessiya muddati tugagan, qayta kiring", { status: 401 });
    }
  }

  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    throw new ApiError(extractMessage(data), { status: res.status, data });
  }

  return data;
}

export const api = {
  get: (path, params, opts) => request(path, { method: "GET", params, ...opts }),
  post: (path, body, opts) => request(path, { method: "POST", body, ...opts }),
  patch: (path, body, opts) => request(path, { method: "PATCH", body, ...opts }),
  delete: (path, opts) => request(path, { method: "DELETE", ...opts }),
};
