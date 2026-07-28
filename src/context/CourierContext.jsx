import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { courierApi } from "../api/courier";
import { connectCourierSocket } from "../api/courierSocket";
import { useToast } from "./ToastContext";

const CourierContext = createContext(null);

const LOCATION_PING_INTERVAL_MS = 20000;

export function CourierProvider({ children }) {
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeOrders, setActiveOrders] = useState([]);
  const [offer, setOffer] = useState(null); // joriy kelayotgan taklif
  const [socketConnected, setSocketConnected] = useState(false);
  const [busy, setBusy] = useState(false); // online/offline/accept kabi amallar davomida

  const pingTimerRef = useRef(null);
  const watchIdRef = useRef(null);

  const isOnline = profile?.courier_status === "online" || profile?.courier_status === "busy";
  const isApproved = !!profile?.is_approved;

  const refreshProfile = useCallback(async () => {
    try {
      const data = await courierApi.profile();
      setProfile(data);
      return data;
    } catch {
      setProfile(null);
      return null;
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const refreshActiveOrders = useCallback(async () => {
    try {
      const orders = await courierApi.activeOrders();
      setActiveOrders(orders || []);
    } catch {
      // jim — asosiy ekran keyingi urinishda yangilanadi
    }
  }, []);

  const checkAvailableOffers = useCallback(async () => {
    try {
      const offers = await courierApi.availableOrders();
      if (offers?.length) setOffer((prev) => prev || offers[0]);
    } catch {
      // jim
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (!profile) return;
    refreshActiveOrders();
    checkAvailableOffers();
  }, [profile, refreshActiveOrders, checkAvailableOffers]);

  // WebSocket: real-time buyurtma takliflari va holat yangilanishlari
  useEffect(() => {
    if (!profile) return;
    const cleanup = connectCourierSocket({
      onOpen: () => setSocketConnected(true),
      onClose: () => setSocketConnected(false),
      onOffer: (data) => {
        // MUHIM: `id` va `expires_in_seconds` spread'dan KEYIN qo'yilishi shart —
        // aks holda `...data.order` ichidagi `order.id` (buyurtma ID) uni bosib
        // o'tib, `accept/` so'roviga noto'g'ri (assignment o'rniga order) ID
        // yuborilishiga va backendda 404 (AssignmentNotFound) ga olib keladi.
        setOffer({
          ...data.order,
          id: data.assignment_id,
          expires_in_seconds: data.expires_in_seconds,
        });
        toast.info("Yangi buyurtma taklifi keldi!");
      },
      onStatus: () => refreshActiveOrders(),
    });
    return cleanup;
  }, [profile, toast, refreshActiveOrders]);

  // Kuryer onlayn bo'lganda joylashuvni davriy yuborish
  useEffect(() => {
    const clearPing = () => {
      clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
      if (watchIdRef.current != null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };

    if (!isOnline || !navigator.geolocation) {
      clearPing();
      return clearPing;
    }

    const sendPing = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          courierApi
            .locationPing({
              latitude: Number(pos.coords.latitude.toFixed(7)),
              longitude: Number(pos.coords.longitude.toFixed(7)),
              accuracy: pos.coords.accuracy,
            })
            .catch((err) => console.warn("location-ping xato:", err));
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 }
      );
    };

    sendPing();
    pingTimerRef.current = setInterval(sendPing, LOCATION_PING_INTERVAL_MS);
    return clearPing;
  }, [isOnline]);

  const goOnline = useCallback(async () => {
    setBusy(true);
    try {
      const updated = await courierApi.goOnline();
      setProfile(updated);
      toast.success("Siz onlaynsiz. Buyurtmalar kelishi mumkin.");
    } catch (e) {
      toast.error(e.message || "Onlayn bo'lib bo'lmadi");
    } finally {
      setBusy(false);
    }
  }, [toast]);

  const goOffline = useCallback(async () => {
    setBusy(true);
    try {
      const updated = await courierApi.goOffline();
      setProfile(updated);
      toast.info("Siz oflaynsiz.");
    } catch (e) {
      toast.error(e.message || "Oflayn bo'lib bo'lmadi");
    } finally {
      setBusy(false);
    }
  }, [toast]);

  const acceptOffer = useCallback(async () => {
    if (!offer) return;
    setBusy(true);
    try {
      await courierApi.acceptOrder(offer.id);
      toast.success("Buyurtma qabul qilindi");
      setOffer(null);
      await refreshActiveOrders();
    } catch (e) {
      toast.error(e.message || "Qabul qilib bo'lmadi");
      setOffer(null);
    } finally {
      setBusy(false);
    }
  }, [offer, toast, refreshActiveOrders]);

  const rejectOffer = useCallback(async () => {
    if (!offer) return;
    const id = offer.id;
    setOffer(null);
    try {
      await courierApi.rejectOrder(id);
    } catch {
      // jim
    }
  }, [offer]);

  const markPickedUp = useCallback(
    async (orderId) => {
      setBusy(true);
      try {
        await courierApi.markPickedUp(orderId);
        toast.success("Buyurtma olindi — yo'lga chiqdingiz");
        await refreshActiveOrders();
      } catch (e) {
        toast.error(e.message || "Amalga oshmadi");
      } finally {
        setBusy(false);
      }
    },
    [toast, refreshActiveOrders]
  );

  const markDelivered = useCallback(
    async (orderId) => {
      setBusy(true);
      try {
        await courierApi.markDelivered(orderId);
        toast.success("Buyurtma yetkazildi. Rahmat!");
        await Promise.all([refreshActiveOrders(), refreshProfile()]);
      } catch (e) {
        toast.error(e.message || "Amalga oshmadi");
      } finally {
        setBusy(false);
      }
    },
    [toast, refreshActiveOrders, refreshProfile]
  );

  return (
    <CourierContext.Provider
      value={{
        profile,
        loadingProfile,
        isOnline,
        isApproved,
        busy,
        socketConnected,
        activeOrders,
        offer,
        goOnline,
        goOffline,
        acceptOffer,
        rejectOffer,
        markPickedUp,
        markDelivered,
        refreshProfile,
        refreshActiveOrders,
      }}
    >
      {children}
    </CourierContext.Provider>
  );
}

export function useCourier() {
  const ctx = useContext(CourierContext);
  if (!ctx) throw new Error("useCourier must be used within CourierProvider");
  return ctx;
}