// Centralized JWT storage. Kept out of React state so the fetch client
// (which is plain JS, not a component) can read/write it directly.

const ACCESS_KEY = "dasturxon_access";
const REFRESH_KEY = "dasturxon_refresh";

export const tokenStore = {
  getAccess() {
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  setTokens({ access, refresh }) {
    if (access) localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
