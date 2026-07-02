import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { cartApi } from "../api/cart";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthed } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busyItemId, setBusyItemId] = useState(null);

  const refresh = useCallback(async () => {
    if (!isAuthed) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const data = await cartApi.get();
      setCart(data);
    } catch (e) {
      // silent — cart is best-effort background state
    } finally {
      setLoading(false);
    }
  }, [isAuthed]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (payload) => {
      try {
        const data = await cartApi.addItem(payload);
        setCart(data);
        toast.success("Savatga qo'shildi");
        return data;
      } catch (e) {
        toast.error(e.message || "Savatga qo'shib bo'lmadi");
        throw e;
      }
    },
    [toast]
  );

  const updateItem = useCallback(
    async (itemId, qty) => {
      setBusyItemId(itemId);
      try {
        const data = await cartApi.updateItem(itemId, qty);
        setCart(data);
      } catch (e) {
        toast.error(e.message || "Miqdorni o'zgartirib bo'lmadi");
      } finally {
        setBusyItemId(null);
      }
    },
    [toast]
  );

  const removeItem = useCallback(
    async (itemId) => {
      setBusyItemId(itemId);
      try {
        const data = await cartApi.removeItem(itemId);
        setCart(data);
      } catch (e) {
        toast.error(e.message || "O'chirib bo'lmadi");
      } finally {
        setBusyItemId(null);
      }
    },
    [toast]
  );

  const applyPromo = useCallback(
    async (code) => {
      try {
        const data = await cartApi.applyPromo(code);
        setCart(data);
        toast.success("Promokod qo'llandi");
        return data;
      } catch (e) {
        toast.error(e.message || "Promokod noto'g'ri");
        throw e;
      }
    },
    [toast]
  );

  const clearCart = useCallback(async () => {
    try {
      await cartApi.clear();
      setCart(null);
      refresh();
    } catch (e) {
      toast.error(e.message || "Savatni tozalab bo'lmadi");
    }
  }, [refresh, toast]);

  const itemCount = cart?.item_count ?? cart?.items?.length ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        busyItemId,
        itemCount,
        refresh,
        addItem,
        updateItem,
        removeItem,
        applyPromo,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
