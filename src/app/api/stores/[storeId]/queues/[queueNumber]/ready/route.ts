import { NextResponse } from "next/server";

import { buildReadyNotification, sendMulticastNotification } from "@/lib/firebaseAdmin";
import { createSupabaseServiceClient } from "@/lib/supabaseServerClient";

type ReadyQueueParams = {
  storeId: string;
  queueNumber: string;
};

const READY_STATUS = 1;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<ReadyQueueParams> }) {
  console.debug("[ready] request received");
  const { storeId: rawStoreId, queueNumber: rawQueueNumber } = await params;
  const storeId = Number(rawStoreId);
  const queueNumber = Number(rawQueueNumber);

  if (!Number.isFinite(storeId) || !Number.isFinite(queueNumber)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();

  const { data: queue, error: queueError } = await supabase
    .from("queues")
    .select("queue_id, status")
    .eq("store_id", storeId)
    .eq("queue_number", queueNumber)
    .maybeSingle();

  if (queueError) {
    return NextResponse.json({ error: "Failed to load queue" }, { status: 500 });
  }

  if (!queue) {
    return NextResponse.json({ error: "Queue not found" }, { status: 404 });
  }

  if (queue.status === READY_STATUS) {
    return NextResponse.json({ ok: true, message: "Queue already marked as ready" });
  }

  const { error: updateError } = await supabase
    .from("queues")
    .update({
      status: READY_STATUS,
      called_at: new Date().toISOString(),
    })
    .eq("queue_id", queue.queue_id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update queue status" }, { status: 500 });
  }

  const [{ data: store, error: storeError }, { data: notifications, error: notificationError }] = await Promise.all([
    supabase.from("stores").select("name").eq("store_id", storeId).maybeSingle(),
    supabase.from("queue_notifications").select("id, fcm_token").eq("store_id", storeId).eq("queue_number", queueNumber),
  ]);

  if (storeError) {
    return NextResponse.json({ error: "Failed to load store" }, { status: 500 });
  }

  if (notificationError) {
    return NextResponse.json({ error: "Failed to load notification tokens" }, { status: 500 });
  }

  if (notifications && notifications.length > 0) {
    console.debug("[ready] sending notifications", {
      storeId,
      queueNumber,
      count: notifications.length,
    });
    const tokens = notifications.map((notification) => notification.fcm_token);
    const notificationPayload = buildReadyNotification({
      storeName: store?.name ?? "TableQR",
      queueNumber,
    });

    const result = await sendMulticastNotification({
      ...notificationPayload,
      tokens,
      android: {
        notification: {
          channelId: "order-status",
          sound: "default",
        },
      },
      webpush: {
        headers: {
          Urgency: "high",
        },
        notification: {
          title: notificationPayload.notification?.title,
          body: notificationPayload.notification?.body,
          icon: "/file.svg",
          tag: `queue-${storeId}-${queueNumber}`,
        },
      },
    });
    console.debug("[ready] multicast result", {
      successCount: result.successCount,
      failureCount: result.failureCount,
    });

    const succeededNotificationIds = notifications
      .filter((_, index) => result.responses[index]?.success)
      .map((notification) => notification.id);

    // Also remove tokens that are permanently invalid to avoid stale rows
    const permanentlyFailedNotificationIds = notifications
      .filter((_, index) => {
        const errorCode = result.responses[index]?.error?.code;
        return (
          errorCode === "messaging/registration-token-not-registered" ||
          errorCode === "messaging/invalid-registration-token"
        );
      })
      .map((notification) => notification.id);

    const idsToDelete = [...new Set([...succeededNotificationIds, ...permanentlyFailedNotificationIds])];

    if (idsToDelete.length > 0) {
      console.debug("[ready] cleaning up queue_notifications", { ids: idsToDelete });
      await supabase.from("queue_notifications").delete().in("id", idsToDelete);
    }
  }

  return NextResponse.json({ ok: true });
}
