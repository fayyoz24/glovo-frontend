import { API_BASE_URL } from "./client";
import { tokenStore } from "./tokenStore";

// API_BASE_URL odatda ".../api/v1" bilan tugaydi — WS server ildizida
// (config/routing.py) ishlaydi, shuning uchun "/api/v1" qismini olib tashlaymiz.
function wsBaseUrl() {
  const httpBase = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
  return httpBase.replace(/^http/, "ws");
}

/**
 * Mijoz uchun buyurtma kuzatuv kanaliga ulanadi.
 * ws/orders/<order_id>/?token=<access> — auth apps/common/ws_auth orqali tekshiriladi.
 * Consumer: OrderTrackingConsumer (apps.dispatch.consumers)
 *
 * @param {string} orderId
 * @param {object} handlers - { onLocation({lat,lng}), onStatus(data), onOpen(), onClose() }
 * @returns {() => void} cleanup — ulanishni yopish uchun chaqiring
 */
export function connectOrderSocket(orderId, handlers = {}) {
  const token = tokenStore.getAccess();
  if (!token || !orderId) return () => {};

  let socket;
  let closedByUs = false;
  let reconnectTimer = null;
  let heartbeatTimer = null;

  const open = () => {
    socket = new WebSocket(`${wsBaseUrl()}/ws/orders/${orderId}/?token=${encodeURIComponent(token)}`);

    socket.onopen = () => {
      handlers.onOpen?.();
      heartbeatTimer = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "ping" }));
        }
      }, 25000);
    };

    socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      if (data.type === "courier.location") {
        handlers.onLocation?.({ lat: data.lat, lng: data.lng });
      }
      if (data.type === "order.status") {
        handlers.onStatus?.(data);
      }
    };

    socket.onclose = () => {
      clearInterval(heartbeatTimer);
      handlers.onClose?.();
      if (!closedByUs) {
        // Ulanish uzilsa 4 soniyadan keyin qayta urinib ko'ramiz
        reconnectTimer = setTimeout(open, 4000);
      }
    };

    socket.onerror = () => {
      socket.close();
    };
  };

  open();

  return () => {
    closedByUs = true;
    clearTimeout(reconnectTimer);
    clearInterval(heartbeatTimer);
    socket?.close();
  };
}
