import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { merchantApi } from "../api/merchant";
import { useToast } from "./ToastContext";

const MerchantContext = createContext(null);

// Real-time push infratuzilmasi hali ulanmagan, shuning uchun yangi
// buyurtmalarni doimiy so'rov (polling) orqali tekshiramiz.
const POLL_INTERVAL_MS = 12000;

const NEW_ORDER_STATUS = "pending";
const ACTIVE_STATUSES = ["merchant_confirmed", "preparing", "ready_for_pickup"];

export function MerchantProvider({ children }) {
  const toast = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [newOrders, setNewOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const prevNewIdsRef = useRef(new Set());
  const pollTimerRef = useRef(null);

  const refreshProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const data = await merchantApi.profile();
      setProfile(data);
      return data;
    } catch {
      setProfile(null);
      return null;
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const refreshOrders = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoadingOrders(true);
      try {
        const [pending, confirmed, preparing, ready] = await Promise.all([
          merchantApi.orders("pending"),
          merchantApi.orders("merchant_confirmed"),
          merchantApi.orders("preparing"),
          merchantApi.orders("ready_for_pickup"),
        ]);

        const pendingList = pending?.results ?? pending ?? [];
        const activeList = [
          ...(confirmed?.results ?? confirmed ?? []),
          ...(preparing?.results ?? preparing ?? []),
          ...(ready?.results ?? ready ?? []),
        ];

        const newIds = new Set(pendingList.map((o) => o.id));
        const prevIds = prevNewIdsRef.current;
        const hasFreshOrder = [...newIds].some((id) => !prevIds.has(id));
        if (prevIds.size > 0 && hasFreshOrder) {
          toast.info("Yangi buyurtma keldi!");
        }
        prevNewIdsRef.current = newIds;

        setNewOrders(pendingList);
        setActiveOrders(activeList);
      } catch {
        // jim — keyingi pollingda qayta urinamiz
      } finally {
        if (!silent) setLoadingOrders(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (!profile || !profile.branch) return;
    refreshOrders();

    pollTimerRef.current = setInterval(() => refreshOrders({ silent: true }), POLL_INTERVAL_MS);
    return () => clearInterval(pollTimerRef.current);
  }, [profile, refreshOrders]);

  const acceptOrder = useCallback(
    async (orderId) => {
      setBusyId(orderId);
      try {
        await merchantApi.confirmOrder(orderId);
        toast.success("Buyurtma qabul qilindi");
        await refreshOrders({ silent: true });
        navigate("/merchant/active");
      } catch (e) {
        toast.error(e.message || "Qabul qilib bo'lmadi");
      } finally {
        setBusyId(null);
      }
    },
    [toast, refreshOrders, navigate]
  );

  const rejectOrder = useCallback(
    async (orderId, note = "") => {
      setBusyId(orderId);
      try {
        await merchantApi.rejectOrder(orderId, note);
        toast.info("Buyurtma rad etildi");
        await refreshOrders({ silent: true });
      } catch (e) {
        toast.error(e.message || "Rad etib bo'lmadi");
      } finally {
        setBusyId(null);
      }
    },
    [toast, refreshOrders]
  );

  const startPreparing = useCallback(
    async (orderId) => {
      setBusyId(orderId);
      try {
        await merchantApi.startPreparing(orderId);
        toast.success("Buyurtma tayyorlanmoqda");
        await refreshOrders({ silent: true });
      } catch (e) {
        toast.error(e.message || "Amalga oshmadi");
      } finally {
        setBusyId(null);
      }
    },
    [toast, refreshOrders]
  );

  const markReady = useCallback(
    async (orderId) => {
      setBusyId(orderId);
      try {
        await merchantApi.markReady(orderId);
        toast.success("Buyurtma kuryer uchun tayyor");
        await refreshOrders({ silent: true });
      } catch (e) {
        toast.error(e.message || "Amalga oshmadi");
      } finally {
        setBusyId(null);
      }
    },
    [toast, refreshOrders]
  );

  const toggleAcceptingOrders = useCallback(
    async (accepting) => {
      try {
        const branch = await merchantApi.toggleAcceptingOrders(accepting);
        setProfile((prev) => (prev ? { ...prev, branch } : prev));
        toast.success(accepting ? "Buyurtmalar qabul qilinmoqda" : "Buyurtmalar to'xtatildi");
      } catch (e) {
        toast.error(e.message || "Amalga oshmadi");
      }
    },
    [toast]
  );

  return (
    <MerchantContext.Provider
      value={{
        profile,
        loadingProfile,
        newOrders,
        activeOrders,
        loadingOrders,
        busyId,
        refreshProfile,
        refreshOrders,
        acceptOrder,
        rejectOrder,
        startPreparing,
        markReady,
        toggleAcceptingOrders,
      }}
    >
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchant() {
  const ctx = useContext(MerchantContext);
  if (!ctx) throw new Error("useMerchant must be used within MerchantProvider");
  return ctx;
}

export { NEW_ORDER_STATUS, ACTIVE_STATUSES };
