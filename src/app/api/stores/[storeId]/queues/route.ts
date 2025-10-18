import { NextResponse } from "next/server";

import { createSupabaseClient } from "@/lib/supabaseClient";
import type { Queue } from "@/types";
import type { WaitlistQueue } from "@/types/waitlist";

type StoreQueuesParams = {
  storeId: string;
};

const toWaitlistQueue = (queue: Pick<Queue, "queue_id" | "queue_number" | "status">): WaitlistQueue => ({
  queue_id: queue.queue_id,
  queue_number: queue.queue_number,
  status: queue.status,
});

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<StoreQueuesParams> }) {
  const { storeId: rawStoreId } = await params;
  const storeId = Number(rawStoreId);

  if (!Number.isFinite(storeId)) {
    return NextResponse.json({ error: "Invalid store id" }, { status: 400 });
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

  const { data: queues, error: queuesError } = await supabase
    .from("queues")
    .select("queue_id, queue_number, status")
    .eq("store_id", storeId)
    .order("queue_number", { ascending: true });

  if (queuesError) {
    return NextResponse.json({ error: "Failed to load waitlist" }, { status: 500 });
  }

  return NextResponse.json({
    queues: ((queues ?? []) as Array<Pick<Queue, "queue_id" | "queue_number" | "status">>).map(toWaitlistQueue),
  });
}
