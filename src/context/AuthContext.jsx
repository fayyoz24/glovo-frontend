import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth";
import { tokenStore } from "../api/tokenStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authed | guest

  const loadMe = useCallback(async () => {
    if (!tokenStore.getAccess()) {
      setStatus("guest");
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus("authed");
    } catch {
      tokenStore.clear();
      setUser(null);
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    loadMe();
    const onLogout = () => {
      setUser(null);
      setStatus("guest");
    };
    window.addEventListener("dasturxon:logout", onLogout);
    return () => window.removeEventListener("dasturxon:logout", onLogout);
  }, [loadMe]);

  const verifyCode = useCallback(
    async (code) => {
      const tokens = await authApi.verifyCode(code);
      tokenStore.setTokens({ access: tokens.access, refresh: tokens.refresh });
      await loadMe();
      return tokens;
    },
    [loadMe]
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setStatus("guest");
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updated = await authApi.updateProfile(payload);
    setUser(updated);
    return updated;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, status, isAuthed: status === "authed", verifyCode, logout, updateProfile, refresh: loadMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
