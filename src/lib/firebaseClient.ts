// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);

let messagingInstance: Messaging | null | undefined; // undefined=uninitialized, null=unsupported
const getMessagingIfSupported = async (): Promise<Messaging | null> => {
  if (typeof window === "undefined") return null;
  if (messagingInstance !== undefined) return messagingInstance;
  try {
    const supported = await isSupported().catch(() => false);
    if (!supported) {
      console.debug("[fcm] messaging not supported in this browser");
      messagingInstance = null;
      return null;
    }
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (err) {
    console.warn("[fcm] getMessaging failed", err);
    messagingInstance = null;
    return null;
  }
};

// 브라우저 푸시 권한 요청 및 토큰 발급
export const getMessagingServiceWorkerRegistration = async () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const existing = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
    if (existing) {
      console.debug("[fcm] existing SW registration found", existing.scope);
      return existing;
    }

    const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.debug("[fcm] SW registered", reg.scope);
    return reg;
  } catch (err) {
    console.error("Service worker registration failed:", err);
    return null;
  }
};

export const requestPermissionAndToken = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("Notifications are not supported in this environment");
    return null;
  }

  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported in this browser");
    return null;
  }

  try {
    const messaging = await getMessagingIfSupported();
    if (!messaging) {
      console.warn("FCM messaging is not supported; skip token request");
      return null;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted");
      return null;
    }

    const serviceWorkerRegistration = await getMessagingServiceWorkerRegistration();

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
      serviceWorkerRegistration: serviceWorkerRegistration ?? undefined,
    });

    console.log("FCM Token:", token);
    return token;
  } catch (err) {
    console.error("FCM token error:", err);
    return null;
  }
};

// 포그라운드 메시지 구독 및 표시 유틸
export const subscribeForegroundMessages = (options?: {
  onDisplay?: (title: string, body: string) => void;
}) => {
  if (typeof window === "undefined") return () => {};

  let unsubscribe: (() => void) | null = null;

  void (async () => {
    const messaging = await getMessagingIfSupported();
    if (!messaging) return;
    unsubscribe = onMessage(messaging, async (payload) => {
      const title = payload.notification?.title ?? "주문 알림";
      const body = payload.notification?.body ?? "";
      console.debug("[fcm] foreground message", { title, body, payload });

      try {
        if ("Notification" in window && Notification.permission === "granted") {
          const reg = await getMessagingServiceWorkerRegistration();
          await reg?.showNotification(title, {
            body,
            icon: "/file.svg",
            tag: (payload as any)?.fcmMessageId ?? undefined,
            data: payload.data ?? {},
          });
        }
        options?.onDisplay?.(title, body);
      } catch (err) {
        console.error("[fcm] foreground notify error", err);
      }
    });
  })();

  return () => {
    try {
      unsubscribe?.();
    } catch {}
  };
};
