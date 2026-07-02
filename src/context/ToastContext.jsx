import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const push = useCallback(
    (message, { type = "info", duration = 3600 } = {}) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (msg, opts) => push(msg, { ...opts, type: "success" }),
    error: (msg, opts) => push(msg, { ...opts, type: "error" }),
    info: (msg, opts) => push(msg, { ...opts, type: "info" }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex w-full max-w-sm items-start gap-2 rounded-2xl border-2 px-4 py-3 shadow-card backdrop-blur-sm animate-[toast-in_.25s_ease] ${
              t.type === "success"
                ? "border-ceramic bg-ceramic/95 text-white"
                : t.type === "error"
                ? "border-pomegranate bg-pomegranate/95 text-white"
                : "border-ink bg-ink/95 text-paper"
            }`}
          >
            {t.type === "success" && <CheckCircle2 size={20} className="mt-0.5 shrink-0" />}
            {t.type === "error" && <XCircle size={20} className="mt-0.5 shrink-0" />}
            {t.type === "info" && <Info size={20} className="mt-0.5 shrink-0" />}
            <p className="flex-1 font-body text-sm leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Yopish"
              className="shrink-0 opacity-80 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
