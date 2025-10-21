import { NextResponse } from "next/server";

import { createSupabaseServiceClient } from "@/lib/supabaseServerClient";

type QueueNotificationParams = {
  storeId: string;
};

type RegisterNotificationPayload = {
  queueNumber?: number;
  fcmToken?: string;
};

const isValidQueueNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0 && value < 10000;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<QueueNotificationParams> }) {
  const { storeId: rawStoreId } = await params;
  const storeId = Number(rawStoreId);

  if (!Number.isFinite(storeId)) {
    return NextResponse.json({ error: "Invalid store id" }, { status: 400 });
  }

  let payload: RegisterNotificationPayload;

  try {
    payload = (await request.json()) as RegisterNotificationPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { queueNumber, fcmToken } = payload;

  // Debug: basic input validation logging (avoid logging full token)
  try {
    console.debug(
      "[queue-notifications] incoming",
      JSON.stringify({ storeId, queueNumber, tokenPreview: typeof fcmToken === "string" ? `${fcmToken.slice(0, 8)}...` : null }),
    );
  } catch {
    // no-op
  }

  if (!isValidQueueNumber(queueNumber) || !fcmToken || typeof fcmToken !== "string") {
    return NextResponse.json({ error: "Invalid queue number or token" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();

  const { data: queue, error: queueError } = await supabase
    .from("queues")
    .select("queue_id")
    .eq("store_id", storeId)
    .eq("queue_number", queueNumber)
    .maybeSingle();

  if (queueError) {
    return NextResponse.json({ error: "Failed to verify queue" }, { status: 500 });
  }

  if (!queue) {
    return NextResponse.json({ error: "Queue not found" }, { status: 404 });
  }

  const { error: upsertError } = await supabase
    .from("queue_notifications")
    .upsert(
      {
        store_id: storeId,
        queue_number: queueNumber,
        fcm_token: fcmToken,
      },
      {
        onConflict: "store_id,queue_number,fcm_token",
      },
    );

  if (upsertError) {
    // If there is no matching unique constraint for onConflict (42P10),
    // fall back to a plain insert to unblock, and treat dup insert (23505) as OK.
    console.error("[queue-notifications] upsert error", upsertError);
    if ((upsertError as any)?.code === "42P10") {
      const { error: insertError } = await supabase.from("queue_notifications").insert({
        store_id: storeId,
        queue_number: queueNumber,
        fcm_token: fcmToken,
      });

      if (insertError && (insertError as any)?.code !== "23505") {
        console.error("[queue-notifications] insert fallback error", insertError);
        const isDev = process.env.NODE_ENV !== "production";
        return NextResponse.json(
          {
            error: "Failed to register notification token",
            details: isDev ? insertError.message ?? String(insertError) : undefined,
            code: isDev ? (insertError as any)?.code : undefined,
            hint: isDev
              ? "Add unique index on (store_id, queue_number, fcm_token) and restore upsert."
              : undefined,
          },
          { status: 500 },
        );
      }
    } else {
      const isDev = process.env.NODE_ENV !== "production";
      return NextResponse.json(
        {
          error: "Failed to register notification token",
          details: isDev ? upsertError.message ?? String(upsertError) : undefined,
          code: isDev ? (upsertError as any)?.code : undefined,
          hint: isDev
            ? "Ensure a unique constraint exists for (store_id, queue_number, fcm_token) or remove onConflict."
            : undefined,
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
