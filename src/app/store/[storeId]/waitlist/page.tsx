import Link from "next/link";
import { notFound } from "next/navigation";

import { WaitlistClientBoard } from "@/components/features/store/WaitlistClientBoard";
import { MobileShell } from "@/components/ui/mobile-shell";
import { IconButton } from "@/components/ui/icon-button";
import { ArrowLeftIcon } from "@/components/ui/icons";
import type { Queue, Store } from "@/types";

type WaitlistPageParams = {
  storeId: string;
};

const createMockStore = (storeId: number): Store => ({
  store_id: storeId,
  name: "TableQR Lounge",
  description: "오늘도 찾아주셔서 감사합니다. 잠시만 기다려 주세요!",
  phone: "02-1234-5678",
  cover_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
  address: "서울특별시 강남구 테이블로 10",
  logo_url: null,
});

const baseQueueSeeds: Array<{ queue_number: number; status: Queue["status"] }> = [
  { queue_number: 101, status: "DONE" },
  { queue_number: 102, status: "DONE" },
  { queue_number: 103, status: "DONE" },
  { queue_number: 104, status: "WAITING" },
  { queue_number: 105, status: "WAITING" },
  { queue_number: 106, status: "WAITING" },
  { queue_number: 107, status: "WAITING" },
  { queue_number: 108, status: "WAITING" },
  { queue_number: 109, status: "WAITING" },
  { queue_number: 110, status: "WAITING" },
  { queue_number: 111, status: "WAITING" },
  { queue_number: 112, status: "WAITING" },
  { queue_number: 113, status: "WAITING" },
  { queue_number: 114, status: "WAITING" },
  { queue_number: 115, status: "WAITING" },
  { queue_number: 116, status: "WAITING" },
  { queue_number: 117, status: "WAITING" },
  { queue_number: 118, status: "WAITING" },
  { queue_number: 119, status: "WAITING" },
  { queue_number: 120, status: "WAITING" },

];

const createMockQueues = (storeId: number): Queue[] =>
  baseQueueSeeds.map((seed, index) => ({
    queue_id: index + 1,
    store_id: storeId,
    queue_number: seed.queue_number,
    status: seed.status,
    created_at: new Date(Date.now() - index * 60_000).toISOString(),
    called_at: seed.status === "DONE" ? new Date(Date.now() - index * 45_000).toISOString() : null,
  }));

export const dynamic = "force-dynamic";

const WaitlistPage = async ({ params }: { params: Promise<WaitlistPageParams> }) => {
  const { storeId: rawStoreId } = await params;
  const storeId = Number(rawStoreId);

  if (Number.isNaN(storeId)) {
    notFound();
  }

  const store = createMockStore(storeId);
  const queues = createMockQueues(storeId);
  const queueSummaries = queues.map(({ queue_id, queue_number, status }) => ({
    queue_id,
    queue_number,
    status,
  }));

  return (
    <MobileShell contentClassName="flex flex-1 flex-col px-0">
      <div className="flex flex-1 flex-col bg-[var(--color-background)]">
        <nav className="sticky top-0 z-20 flex items-center justify-between bg-[var(--color-background)]/95 px-[var(--spacing-gutter)] pb-3 pt-[calc(var(--safe-top,0px)+0.75rem)] backdrop-blur">
          <Link href={`/store/${store.store_id}`} aria-label="매장으로 돌아가기">
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
          <WaitlistClientBoard storeId={store.store_id} initialQueues={queueSummaries} />
        </main>
      </div>
    </MobileShell>
  );
};

export default WaitlistPage;
