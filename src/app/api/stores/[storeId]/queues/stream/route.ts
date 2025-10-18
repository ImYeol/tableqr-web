import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { createSupabaseClient } from "@/lib/supabaseClient";
import type { Queue } from "@/types";
import type { WaitlistQueue, WaitlistStreamMessage } from "@/types/waitlist";

type StreamParams = {
  storeId: string;
};

const encoder = new TextEncoder();

const toWaitlistQueue = (queue: Pick<Queue, "queue_id" | "queue_number" | "status">): WaitlistQueue => ({
  queue_id: queue.queue_id,
  queue_number: queue.queue_number,
  status: queue.status,
});

const toWaitlistQueueOrNull = (queue: Queue | null): WaitlistQueue | null => (queue ? toWaitlistQueue(queue) : null);

const createSseChunk = (message: WaitlistStreamMessage) => encoder.encode(`data: ${JSON.stringify(message)}\n\n`);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<StreamParams> }) {
  const { storeId: rawStoreId } = await params;
  const storeId = Number(rawStoreId);

  if (!Number.isFinite(storeId)) {
    return new Response("Invalid store id", { status: 400 });
  }

  const supabase = createSupabaseClient();

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("store_id")
    .eq("store_id", storeId)
    .maybeSingle();

  if (storeError) {
    return new Response("Failed to verify store", { status: 500 });
  }

  if (!store) {
    return new Response("Store not found", { status: 404 });
  }

  const { data: initialQueues, error: queuesError } = await supabase
    .from("queues")
    .select("queue_id, queue_number, status")
    .eq("store_id", storeId)
    .order("queue_number", { ascending: true });

  if (queuesError) {
    return new Response("Failed to load waitlist", { status: 500 });
  }

  let channel: RealtimeChannel | null = null;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const snapshotData = ((initialQueues ?? []) as Array<Pick<Queue, "queue_id" | "queue_number" | "status">>).map(
        (queue) => toWaitlistQueue(queue),
      );
      controller.enqueue(createSseChunk({ type: "snapshot", data: snapshotData }));

      const handlePayload = (payload: RealtimePostgresChangesPayload<Queue>) => {
        console.log("Received payload:", payload);
        const payloadStoreId =
          ((payload.new as Queue | null)?.store_id ?? (payload.old as Queue | null)?.store_id) ?? null;

        if (payloadStoreId !== storeId) {
          return;
        }

        const message: WaitlistStreamMessage = {
          type: "mutation",
          data: {
            eventType: payload.eventType,
            new: toWaitlistQueueOrNull((payload.new as Queue | null) ?? null),
            old: toWaitlistQueueOrNull((payload.old as Queue | null) ?? null),
          },
        };

        controller.enqueue(createSseChunk(message));
      };

      channel = supabase
        .channel(`waitlist-queues-${storeId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "queues",
            filter: `store_id=eq.${storeId}`,
          },
          handlePayload,
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "queues",
            filter: `store_id=eq.${storeId}`,
          },
          handlePayload,
        )

      await channel.subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          controller.error(new Error("Realtime subscription error"));
        }
      });

      const closeChannel = () => {
        if (channel) {
          supabase.removeChannel(channel);
          channel = null;
        }
      };

      request.signal.addEventListener("abort", () => {
        closeChannel();
        controller.close();
      });
    },
    cancel() {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
      "Transfer-Encoding": "chunked",
    },
  });
}
