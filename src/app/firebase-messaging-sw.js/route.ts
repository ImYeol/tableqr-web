const FIREBASE_APP_COMPAT = "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
const FIREBASE_MESSAGING_COMPAT = "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (Object.values(config).some((value) => !value)) {
    return new Response("// Firebase configuration is missing", {
      status: 500,
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-store",
      },
    });
  }

  const script = `
    importScripts("${FIREBASE_APP_COMPAT}");
    importScripts("${FIREBASE_MESSAGING_COMPAT}");

    firebase.initializeApp(${JSON.stringify(config)});
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const title = payload.notification?.title ?? "주문 알림";
      const notificationOptions = {
        body: payload.notification?.body ?? "",
        icon: payload.notification?.icon ?? "/file.svg",
        data: payload.data ?? {},
      };

      self.registration.showNotification(title, notificationOptions);
    });

    self.addEventListener("notificationclick", (event) => {
      event.notification.close();
      const targetUrl = event.notification?.data?.url ?? "/";

      event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes(self.location.origin)) {
              client.focus();
              if (targetUrl && targetUrl !== "/" && "navigate" in client) {
                client.navigate(targetUrl);
              }
              return;
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(targetUrl);
          }
        }),
      );
    });
  `;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
