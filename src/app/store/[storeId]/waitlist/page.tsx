import Link from "next/link";
import { notFound } from "next/navigation";

import { WaitlistClientBoard } from "@/components/features/store/WaitlistClientBoard";
import { MobileShell } from "@/components/ui/mobile-shell";
import { IconButton } from "@/components/ui/icon-button";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { createSupabaseClient } from "@/lib/supabaseClient";
import type { Queue } from "@/types";
import type { WaitlistQueue } from "@/types/waitlist";

type WaitlistPageParams = {
  storeId: string;
};

const mapToWaitlistQueue = (queue: Pick<Queue, "queue_id" | "queue_number" | "status">): WaitlistQueue => ({
  queue_id: queue.queue_id,
  queue_number: queue.queue_number,
  status: queue.status,
});

// const baseQueueSeeds: Array<{ queue_number: number; status: Queue["status"] }> = [
//   { queue_number: 101, status: "DONE" },
//   { queue_number: 102, status: "DONE" },
//   { queue_number: 103, status: "DONE" },
//   { queue_number: 104, status: "WAITING" },
//   { queue_number: 105, status: "WAITING" },
//   { queue_number: 106, status: "WAITING" },
//   { queue_number: 107, status: "WAITING" },
//   { queue_number: 108, status: "WAITING" },
//   { queue_number: 109, status: "WAITING" },
//   { queue_number: 110, status: "WAITING" },
//   { queue_number: 111, status: "WAITING" },
//   { queue_number: 112, status: "WAITING" },
//   { queue_number: 113, status: "WAITING" },
//   { queue_number: 114, status: "WAITING" },
//   { queue_number: 115, status: "WAITING" },
//   { queue_number: 116, status: "WAITING" },
//   { queue_number: 117, status: "WAITING" },
//   { queue_number: 118, status: "WAITING" },
//   { queue_number: 119, status: "WAITING" },
//   { queue_number: 120, status: "WAITING" },

// ];

export const dynamic = "force-dynamic";

const WaitlistPage = async ({ params }: { params: Promise<WaitlistPageParams> }) => {
  const { storeId: rawStoreId } = await params;
  const storeId = Number(rawStoreId);

  if (Number.isNaN(storeId)) {
    notFound();
  }

  const supabase = createSupabaseClient();

  console.log("store id2", storeId);

  const { data: queues, error: queuesError } = await supabase
    .from("queues")
    .select("queue_id, queue_number, status")
    .eq("store_id", storeId)
    // .order("queue_number", { ascending: true });

  if (queuesError) {
    throw new Error(`Failed to load waitlist: ${queuesError.message}`);
  }

  console.log(queues);

  const queueSummaries = ((queues ?? []) as Array<Pick<Queue, "queue_id" | "queue_number" | "status">>).map(mapToWaitlistQueue);

  return (
    <MobileShell contentClassName="flex flex-1 flex-col px-0">
      <div className="flex flex-1 flex-col bg-[var(--color-background)]">
        <nav className="sticky top-0 z-20 flex items-center justify-between bg-[var(--color-background)]/95 px-[var(--spacing-gutter)] pb-3 pt-[calc(var(--safe-top,0px)+0.75rem)] backdrop-blur">
          <Link href={`/store/${storeId}`} aria-label="매장으로 돌아가기">
            <IconButton
              size="sm"
              variant="ghost"
              className="bg-white text-foreground shadow-[0_16px_32px_-28px_rgba(31,27,22,0.28)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </IconButton>
          </Link>
          <span className="text-lg font-semibold text-muted-foreground">대기 현황</span>
          <span className="w-10" aria-hidden="true" />
        </nav>

        <main className="flex-1 space-y-8 px-[var(--spacing-gutter)] pb-[calc(var(--safe-bottom,0px)+4rem)] pt-6">
          <WaitlistClientBoard storeId={storeId} initialQueues={queueSummaries} />
        </main>
      </div>
    </MobileShell>
  );
};

export default WaitlistPage;
