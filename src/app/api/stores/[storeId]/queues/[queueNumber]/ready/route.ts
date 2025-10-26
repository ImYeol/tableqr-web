import { NextResponse } from "next/server";

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

  console.debug("[ready] queue marked as ready", { storeId, queueNumber });

  return NextResponse.json({ ok: true });
}
