import React, { createContext, useContext, useState, useCallback } from "react";
import { S } from "./styles";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={S.toastWrap}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              ...S.toast,
              background:
                t.type === "success"
                  ? "rgba(16,185,129,0.95)"
                  : t.type === "error"
                  ? "rgba(239,68,68,0.95)"
                  : "rgba(124,58,237,0.95)",
            }}
          >
            {t.type === "success" ? "✓ " : t.type === "error" ? "✕ " : ""}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
