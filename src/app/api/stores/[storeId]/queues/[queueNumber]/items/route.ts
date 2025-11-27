import { NextResponse } from "next/server";

import { createSupabaseClient } from "@/lib/supabaseClient";
import type { QueueItem } from "@/types";

type QueueItemsParams = {
  storeId: string;
  queueNumber: string;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<QueueItemsParams> }) {
  const { storeId: rawStoreId, queueNumber: rawQueueNumber } = await params;
  const storeId = Number(rawStoreId);
  const queueNumber = Number(rawQueueNumber);

  if (!Number.isFinite(storeId)) {
    return NextResponse.json({ error: "Invalid store id" }, { status: 400 });
  }

  if (!Number.isFinite(queueNumber)) {
    return NextResponse.json({ error: "Invalid queue number" }, { status: 400 });
  }

  const supabase = createSupabaseClient();

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("store_id")
    .eq("store_id", storeId)
    .maybeSingle();

  if (storeError) {
    return NextResponse.json({ error: "Failed to verify store" }, { status: 500 });
  }

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // 큐 번호로 큐 ID 찾기
  const { data: queue, error: queueError } = await supabase
    .from("queues")
    .select("queue_id")
    .eq("store_id", storeId)
    .eq("queue_number", queueNumber)
    .maybeSingle();

  if (queueError) {
    return NextResponse.json({ error: "Failed to find queue" }, { status: 500 });
  }

  if (!queue) {
    return NextResponse.json({ error: "Queue not found" }, { status: 404 });
  }

  // 큐 ID로 주문 항목 가져오기
  const { data: items, error: itemsError } = await supabase
    .from("queue_items")
    .select("*")
    .eq("queue_id", queue.queue_id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    return NextResponse.json({ error: "Failed to load queue items" }, { status: 500 });
  }

  return NextResponse.json({
    items: (items ?? []) as QueueItem[],
  });
}

