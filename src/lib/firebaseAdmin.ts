import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging, type MulticastMessage } from "firebase-admin/messaging";

import { serverEnv } from "./env.server";

const apps = getApps();

const app =
  apps.length > 0
    ? apps[0]
    : initializeApp({
        credential: cert({
          projectId: serverEnv.firebase.projectId,
          clientEmail: serverEnv.firebase.clientEmail,
          privateKey: serverEnv.firebase.privateKey,
        }),
      });

const messaging = getMessaging(app);

export const sendMulticastNotification = async (message: MulticastMessage) => {
  if (!message.tokens?.length) {
    return { successCount: 0, failureCount: 0, responses: [] };
  }

  return messaging.sendEachForMulticast(message);
};

export const buildReadyNotification = (params: { storeName: string; queueNumber: number }) => {
  const { storeName, queueNumber } = params;
  const formattedNumber = queueNumber.toString().padStart(2, "0");

  return {
    notification: {
      title: `${storeName}`,
      body: `주문 번호 ${formattedNumber} 준비가 완료되었습니다.`,
      sound: "default",
      vibrate: [200, 100, 200],
    },
    data: {
      queueNumber: String(queueNumber),
      ready: "true",
    },
  };
};
