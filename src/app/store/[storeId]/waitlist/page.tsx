import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonClassName } from "@/components/ui/button";
import { createSupabaseClient } from "@/lib/supabaseClient";
import type { Queue, Store } from "@/types";

type WaitlistPageParams = {
  storeId: string;
};

const fetchWaitlistData = async (storeId: number) => {
  const supabase = createSupabaseClient();

  const [storeResponse, queueResponse] = await Promise.all([
    supabase
      .from("stores")
      .select("store_id, name, description, cover_url")
      .eq("store_id", storeId)
      .maybeSingle(),
    supabase
      .from("queues")
      .select("queue_id, store_id, queue_number, status, created_at, called_at")
      .eq("store_id", storeId)
      .order("queue_number", { ascending: true }),
  ]);

  if (storeResponse.error || !storeResponse.data) {
    return null;
  }

  return {
    store: storeResponse.data as Store,
    queues: (queueResponse.data as Queue[] | null) ?? [],
  };
};

const sortAsc = (queues: Queue[]) => [...queues].sort((a, b) => a.queue_number - b.queue_number);

export const dynamic = "force-dynamic";

const WaitlistPage = async ({ params }: { params: Promise<WaitlistPageParams> }) => {
  const { storeId: rawStoreId } = await params;
  const storeId = Number(rawStoreId);

  if (Number.isNaN(storeId)) {
    notFound();
  }

  const result = await fetchWaitlistData(storeId);

  if (!result) {
    notFound();
  }

  const { store, queues } = result;

  const waitingQueues = sortAsc(queues.filter((queue) => queue.status === "WAITING"));
  const doneQueues = sortAsc(queues.filter((queue) => queue.status === "DONE"));

  const nextQueueNumber = waitingQueues[0]?.queue_number ?? null;
  const waitingNumbers = waitingQueues.slice(0, 6).map((queue) => queue.queue_number);
  const doneNumbers = doneQueues.slice(-6).map((queue) => queue.queue_number);

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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-500 via-brand-400 to-brand-600">
      {store.cover_url ? (
        <div className="absolute inset-0">
          <img alt="" src={store.cover_url} className="h-full w-full scale-110 object-cover opacity-25 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/20 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_55%)]" />
      )}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-12 px-6 py-16 text-center text-white sm:px-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">Waitlist</p>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">{store.name}</h1>
          <p className="mx-auto max-w-xl text-sm text-white/80 md:text-base">
            지금 매장의 실시간 대기 현황을 확인하고, 호출된 번호와 완료된 번호를 한눈에 살펴보세요.
          </p>
        </div>

        <div className="w-full max-w-3xl rounded-[var(--radius-lg)] border border-white/20 bg-white/95 p-8 text-left text-foreground shadow-[0_36px_60px_-30px_rgba(31,27,22,0.55)] backdrop-blur">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground/70">Now Serving</p>
              <p className="mt-2 text-3xl font-semibold text-brand-600">
                {nextQueueNumber ? `대기번호 ${nextQueueNumber}` : "대기 중인 팀이 없습니다"}
              </p>
            </div>
            <Link
              href={`/store/${store.store_id}`}
              className={buttonClassName({ variant: "ghost", size: "sm", className: "gap-2 text-brand-600" })}
            >
              매장으로 돌아가기
            </Link>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
                현재 접수
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {waitingNumbers.length ? (
                  waitingNumbers.map((number) => (
                    <span
                      key={`waiting-${number}`}
                      className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-200/80 bg-brand-50 text-2xl font-semibold text-brand-600 shadow-[0_18px_36px_-28px_rgba(255,120,56,0.8)]"
                    >
                      {number}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground/70">현재 접수 중인 번호가 없습니다.</p>
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground/70">총 {waitingQueues.length}팀 대기 중</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
                주문 완료
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {doneNumbers.length ? (
                  doneNumbers.map((number) => (
                    <span
                      key={`done-${number}`}
                      className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-success/30 bg-success/10 text-2xl font-semibold text-success shadow-[0_18px_36px_-30px_rgba(63,191,143,0.65)]"
                    >
                      {number}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground/70">완료된 주문이 아직 없습니다.</p>
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground/70">총 {doneQueues.length}팀 완료됨</p>
            </section>
          </div>

          {queueUpdatedAt ? (
            <p className="mt-8 text-right text-xs text-muted-foreground/60">
              최근 업데이트: {queueUpdatedAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default WaitlistPage;
