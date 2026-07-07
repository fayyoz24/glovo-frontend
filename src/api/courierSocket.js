import { API_BASE_URL } from "./client";
import { tokenStore } from "./tokenStore";

// API_BASE_URL odatda ".../api/v1" bilan tugaydi — WS server ildizida
// (config/routing.py) ishlaydi, shuning uchun "/api/v1" qismini olib tashlaymiz.
function wsBaseUrl() {
  const httpBase = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
  return httpBase.replace(/^http/, "ws");
}

/**
 * Kuryerning real-time buyurtma takliflari kanaliga ulanadi.
 * ws/courier/?token=<access>  — auth apps/common/ws_auth orqali tekshiriladi.
 *
 * @param {object} handlers - { onOffer(data), onStatus(data), onOpen(), onClose() }
 * @returns {() => void} cleanup — ulanishni yopish uchun chaqiring
 */
export function connectCourierSocket(handlers = {}) {
  const token = tokenStore.getAccess();
  if (!token) return () => {};

  let socket;
  let closedByUs = false;
  let reconnectTimer = null;
  let heartbeatTimer = null;

  const open = () => {
    socket = new WebSocket(`${wsBaseUrl()}/ws/courier/?token=${encodeURIComponent(token)}`);

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
      if (data.type === "order.offer") handlers.onOffer?.(data);
      if (data.type === "order.status") handlers.onStatus?.(data);
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
