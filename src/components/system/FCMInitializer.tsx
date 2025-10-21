"use client";

import { useEffect } from "react";

import { getMessagingServiceWorkerRegistration, subscribeForegroundMessages } from "@/lib/firebaseClient";
import { useToast } from "@/components/ui/toast/ToastProvider";

export const FCMInitializer = () => {
  const { show } = useToast();
  useEffect(() => {
    console.debug("[fcm] initializer mount");
    void getMessagingServiceWorkerRegistration();

    // Safely attach a SW 'message' listener only if supported and ready
    let swMessageHandler: ((event: MessageEvent) => void) | null = null;
    let removeSWListener: (() => void) | null = null;

    if (typeof navigator !== "undefined" && "serviceWorker" in navigator && navigator.serviceWorker) {
      try {
        // Prefer attaching to the registration's active worker when ready
        navigator.serviceWorker.ready
          .then((reg) => {
            swMessageHandler = (event: MessageEvent) => {
              console.debug("[fcm] SW message", event.data);
            };
            reg.active?.addEventListener("message", swMessageHandler as EventListener);
            removeSWListener = () => reg.active?.removeEventListener("message", swMessageHandler as EventListener);
          })
          .catch(() => {
            // Fallback: attach to navigator.serviceWorker if available
            const anySW: any = navigator.serviceWorker as any;
            if (typeof anySW?.addEventListener === "function") {
              swMessageHandler = (event: MessageEvent) => {
                console.debug("[fcm] SW message", event.data);
              };
              anySW.addEventListener("message", swMessageHandler as EventListener);
              removeSWListener = () => anySW.removeEventListener("message", swMessageHandler as EventListener);
            }
          });
      } catch (err) {
        console.warn("[fcm] SW message listener not attached", err);
      }
    } else {
      console.debug("[fcm] serviceWorker not supported in this environment");
    }

    const unsubscribe = subscribeForegroundMessages({
      onDisplay: (title, body) => {
        show({ title, description: body });
      },
    });

    return () => {
      console.debug("[fcm] initializer unmount");
      try {
        removeSWListener?.();
      } catch {}
      unsubscribe();
    };
  }, []);

  return null;
};
