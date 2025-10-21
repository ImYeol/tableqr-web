import { NextResponse } from "next/server";

import { buildReadyNotification, sendMulticastNotification } from "@/lib/firebaseAdmin";
import { createSupabaseServiceClient } from "@/lib/supabaseServerClient";

type Payload = {
  storeId?: number;
  queueNumber?: number;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { storeId, queueNumber } = payload;
  if (!Number.isFinite(storeId) || !Number.isFinite(queueNumber)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();

  const [{ data: store, error: storeError }, { data: notifications, error: notificationError }] = await Promise.all([
    supabase.from("stores").select("name").eq("store_id", storeId).maybeSingle(),
    supabase.from("queue_notifications").select("id, fcm_token").eq("store_id", storeId).eq("queue_number", queueNumber),
  ]);

  if (storeError) {
    console.error("[queue-events/ready] store load error", storeError);
    return NextResponse.json({ error: "Failed to load store" }, { status: 500 });
  }
  if (notificationError) {
    console.error("[queue-events/ready] notifications load error", notificationError);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }

  if (!notifications || notifications.length === 0) {
    return NextResponse.json({ ok: true, message: "No tokens to notify" });
  }

  const tokens = notifications.map((n) => n.fcm_token);
  const notificationPayload = buildReadyNotification({ storeName: store?.name ?? "TableQR", queueNumber: queueNumber! });

  const result = await sendMulticastNotification({
    ...notificationPayload,
    tokens,
    android: { notification: { channelId: "order-status", sound: "default" } },
    webpush: {
      headers: { Urgency: "high" },
      notification: {
        title: notificationPayload.notification?.title,
        body: notificationPayload.notification?.body,
        icon: "/file.svg",
        tag: `queue-${storeId}-${queueNumber}`,
      },
    },
  });

  const succeededIds = notifications
    .filter((_, i) => result.responses[i]?.success)
    .map((n) => n.id);
  const permanentlyFailedIds = notifications
    .filter((_, i) => {
      const code = result.responses[i]?.error?.code;
      return code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token";
    })
    .map((n) => n.id);
  const idsToDelete = [...new Set([...succeededIds, ...permanentlyFailedIds])];

  if (idsToDelete.length > 0) {
    await supabase.from("queue_notifications").delete().in("id", idsToDelete);
  }

  return NextResponse.json({ ok: true, successCount: result.successCount, failureCount: result.failureCount });
}
