"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = {
  id: number;
  title?: string;
  description?: string;
};

type ToastContextValue = {
  show: (toast: Omit<Toast, "id"> & { durationMs?: number }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((toast: Omit<Toast, "id"> & { durationMs?: number }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const { durationMs = 3500, ...rest } = toast;
    setToasts((prev) => [...prev, { id, ...rest }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, durationMs);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-[var(--safe-top,0px)] z-[1000] flex w-full justify-center p-4">
        <div className="flex w-full max-w-md flex-col items-stretch gap-3">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="pointer-events-auto rounded-[var(--radius-lg)] border border-border-soft bg-surface px-4 py-3 shadow-[0_10px_24px_-12px_rgba(31,27,22,0.28)]"
              role="status"
              aria-live="polite"
            >
              {t.title ? <div className="text-sm font-semibold text-foreground">{t.title}</div> : null}
              {t.description ? <div className="mt-0.5 text-xs text-muted-foreground">{t.description}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

