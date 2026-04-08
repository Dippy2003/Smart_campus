import { createContext, useContext, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const api = useMemo(() => {
    return {
      success: (message, opts) => toast.success(message, opts),
      error: (message, opts) => toast.error(message, opts),
      info: (message, opts) => toast(message, opts),
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            background: "rgba(15, 23, 42, 0.95)",
            color: "#e2e8f0",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            backdropFilter: "blur(10px)",
          },
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

