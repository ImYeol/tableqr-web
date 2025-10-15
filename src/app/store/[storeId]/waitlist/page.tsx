import Link from "next/link";
import { notFound } from "next/navigation";

import { MobileShell } from "@/components/ui/mobile-shell";
import { IconButton } from "@/components/ui/icon-button";
import { ArrowLeftIcon } from "@/components/ui/icons";
import type { Queue, Store } from "@/types";

type WaitlistPageParams = {
  storeId: string;
};

// const fetchWaitlistData = async (storeId: number) => {
//   const supabase = createSupabaseClient();
//
//   const [storeResponse, queueResponse] = await Promise.all([
//     supabase
//       .from("stores")
//       .select("store_id, name, description, cover_url")
//       .eq("store_id", storeId)
//       .maybeSingle(),
//     supabase
//       .from("queues")
//       .select("queue_id, store_id, queue_number, status, created_at, called_at")
//       .eq("store_id", storeId)
//       .order("queue_number", { ascending: true }),
//   ]);
//
//   if (storeResponse.error || !storeResponse.data) {
//    return null;
//   }
//
//   return {
//     store: storeResponse.data as Store,
//     queues: (queueResponse.data as Queue[] | null) ?? [],
//   };
// };

const mockStore: Store = {
  store_id: 1,
  name: "TableQR Lounge",
  description: "오늘도 찾아주셔서 감사합니다. 잠시만 기다려 주세요!",
  phone: "02-1234-5678",
  cover_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
  address: "서울특별시 강남구 테이블로 10",
  logo_url: null
};

const mockQueues: Queue[] = [
  { queue_id: 1, store_id: 1, queue_number: 101, status: "DONE", created_at: new Date().toISOString(), called_at: new Date().toISOString() },
  { queue_id: 2, store_id: 1, queue_number: 102, status: "DONE", created_at: new Date().toISOString(), called_at: new Date().toISOString() },
  { queue_id: 3, store_id: 1, queue_number: 103, status: "DONE", created_at: new Date().toISOString(), called_at: new Date().toISOString() },
  { queue_id: 4, store_id: 1, queue_number: 104, status: "WAITING", created_at: new Date().toISOString(), called_at: null },
  { queue_id: 5, store_id: 1, queue_number: 105, status: "WAITING", created_at: new Date().toISOString(), called_at: null },
  { queue_id: 6, store_id: 1, queue_number: 106, status: "WAITING", created_at: new Date().toISOString(), called_at: null },
  { queue_id: 7, store_id: 1, queue_number: 107, status: "WAITING", created_at: new Date().toISOString(), called_at: null },
];

const sortAsc = (queues: Queue[]) => [...queues].sort((a, b) => a.queue_number - b.queue_number);

export const dynamic = "force-dynamic";

const WaitlistPage = async ({ params }: { params: Promise<WaitlistPageParams> }) => {
  const { storeId: rawStoreId } = await params;
  const storeId = Number(rawStoreId);

  if (Number.isNaN(storeId)) {
    notFound();
  }

  // const result = await fetchWaitlistData(storeId);
  const result = {
    store: mockStore,
    queues: mockQueues,
  };

  if (!result) {
    notFound();
  }

  const { store, queues } = result;

  const waitingQueues = sortAsc(queues.filter((queue) => queue.status === "WAITING"));
  const doneQueues = sortAsc(queues.filter((queue) => queue.status === "DONE"));

  const nextQueueNumber = waitingQueues[0]?.queue_number ?? null;
  const waitingNumbers = waitingQueues.slice(0, 12).map((queue) => queue.queue_number);
  const doneNumbers = doneQueues.slice(-12).map((queue) => queue.queue_number);

  const queueUpdatedAt = queues.length
    ? new Date(
        Math.max(
          ...queues.map((queue) =>
            new Date(queue.called_at ?? queue.created_at ?? new Date().toISOString()).getTime(),
          ),
        ),
      )
    : null;

  return (
    <MobileShell contentClassName="flex flex-1 flex-col px-0 pb-12">
      <nav className="sticky top-0 z-20 flex items-center justify-between bg-[var(--color-background)]/95 px-5 pb-3 pt-[calc(var(--safe-top,0px)+0.75rem)] backdrop-blur">
        <Link href={`/store/${store.store_id}`} aria-label="매장으로 돌아가기">
          <IconButton
            size="sm"
            variant="ghost"
            className="bg-white text-foreground shadow-[0_16px_32px_-28px_rgba(31,27,22,0.28)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </IconButton>
        </Link>
        <span className="text-sm font-semibold text-muted-foreground">대기 현황</span>
        <span className="w-10" aria-hidden="true" />
      </nav>

      <header className="space-y-3 px-5 pt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground/70">웨이팅 현황</p>
        <h1 className="font-display text-3xl font-semibold text-foreground">{store.name}</h1>
        <p className="text-sm text-muted-foreground">
          준비된 주문과 진행 중인 주문 번호를 실시간으로 확인하세요.
        </p>
      </header>

      <section className="space-y-8 px-5 pt-4">
        <article className="overflow-hidden rounded-[calc(var(--radius-lg)+0.6rem)] border border-success/25 bg-white shadow-[0_30px_80px_-50px_rgba(31,27,22,0.45)]">
          <div className="bg-success px-6 py-5 text-white">
            <h2 className="text-sm font-semibold uppercase tracking-[0.26em]">준비 완료</h2>
            <p className="mt-1 text-xs text-white/80">픽업 가능한 주문 번호를 확인해주세요.</p>
          </div>
          <div className="space-y-6 px-6 py-8">
            {doneNumbers.length ? (
              <div className="grid grid-cols-3 justify-items-center gap-4 sm:grid-cols-4">
                {doneNumbers.map((number) => (
                  <span
                    key={`done-${number}`}
                    className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-success/55 bg-success/10 text-xl font-semibold text-success shadow-[0_24px_36px_-28px_rgba(63,191,143,0.45)] sm:h-20 sm:w-20"
                  >
                    {number}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground/80">준비 완료된 주문이 아직 없습니다.</p>
            )}
            <p className="text-xs text-muted-foreground/75">총 {doneQueues.length}팀 완료됨</p>
          </div>
        </article>

        <article className="overflow-hidden rounded-[calc(var(--radius-lg)+0.6rem)] border border-brand-200/50 bg-white shadow-[0_30px_80px_-50px_rgba(31,27,22,0.45)]">
          <div className="bg-brand-500 px-6 py-5 text-white">
            <h2 className="text-sm font-semibold uppercase tracking-[0.26em]">준비 중</h2>
            <p className="mt-1 text-xs text-white/80">
              {nextQueueNumber ? `다음 호출 예정: 대기번호 ${nextQueueNumber}` : "곧 새로운 호출이 업데이트됩니다."}
            </p>
          </div>
          <div className="space-y-6 px-6 py-8">
            {waitingNumbers.length ? (
              <div className="grid grid-cols-3 justify-items-center gap-4 sm:grid-cols-4">
                {waitingNumbers.map((number) => (
                  <span
                    key={`waiting-${number}`}
                    className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 text-xl font-semibold text-brand-600 shadow-[0_24px_36px_-28px_rgba(47,111,76,0.35)] sm:h-20 sm:w-20"
                  >
                    {number}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground/80">현재 진행 중인 주문 번호가 없습니다.</p>
            )}
            <p className="text-xs text-muted-foreground/75">총 {waitingQueues.length}팀 대기 중</p>
          </div>
        </article>
      </section>

      {queueUpdatedAt ? (
        <p className="px-5 text-right text-xs text-muted-foreground/70">
          최근 업데이트: {queueUpdatedAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      ) : null}
    </MobileShell>
  );
};

export default WaitlistPage;
