'use client';

import { useEffect, useMemo, useState } from "react";

import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { getBrowserSupabaseClient } from "@/lib/supabaseClient";
import type { Queue, QueueStatus } from "@/types";

interface QueueBoardProps {
  storeId: number;
  initialQueues: Queue[];
}

const statusLabels: Record<QueueStatus, string> = {
  WAITING: "대기 중",
  CALLED: "호출됨",
  DONE: "완료",
  CANCELED: "취소",
};

const statusStyles: Record<QueueStatus, string> = {
  WAITING: "bg-neutral-200 text-neutral-700",
  CALLED: "bg-amber-200 text-amber-700",
  DONE: "bg-emerald-200 text-emerald-700",
  CANCELED: "bg-rose-200 text-rose-700",
};

const sortQueues = (queues: Queue[]) =>
  [...queues].sort((a, b) => a.queue_number - b.queue_number);

export const QueueBoard = ({ storeId, initialQueues }: QueueBoardProps) => {
  const [queues, setQueues] = useState(() => sortQueues(initialQueues));

  useEffect(() => {
    setQueues(sortQueues(initialQueues));
  }, [initialQueues]);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    const channel = supabase
      .channel(`queues-store-${storeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queues",
          filter: `store_id=eq.${storeId}`,
        },
        (payload: RealtimePostgresChangesPayload<Queue>) => {
          setQueues((prev) => {
            if (payload.eventType === "DELETE" && payload.old) {
              return sortQueues(prev.filter((queue) => queue.queue_id !== (payload.old as Queue).queue_id));
            }

            const nextQueue = payload.new as Queue;
            const existingIndex = prev.findIndex((queue) => queue.queue_id === nextQueue.queue_id);
            if (existingIndex === -1) {
              return sortQueues([...prev, nextQueue]);
            }

            const updated = [...prev];
            updated[existingIndex] = nextQueue;
            return sortQueues(updated);
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId]);

  const summary = useMemo(() => {
    const waiting = queues.filter((queue) => queue.status === "WAITING").length;
    const called = queues.filter((queue) => queue.status === "CALLED").length;
    const done = queues.filter((queue) => queue.status === "DONE").length;

    const nextQueue = queues.find((queue) => queue.status === "WAITING");

    return {
      waiting,
      called,
      done,
      nextUp: nextQueue ? `대기번호 ${nextQueue.queue_number}` : "대기 중인 팀이 없습니다.",
    };
  }, [queues]);

  return (
    <section className="space-y-4">
      <header className="px-1">
        <h2 className="text-2xl font-semibold text-neutral-900">대기 현황</h2>
        <p className="text-sm text-neutral-500">Supabase Realtime 연동으로 실시간 업데이트됩니다.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white/90 p-5 shadow-sm">
          <p className="text-sm text-neutral-500">현재 대기 팀</p>
          <p className="mt-1 text-3xl font-semibold text-neutral-900">{summary.waiting}팀</p>
        </div>
        <div className="rounded-2xl bg-white/90 p-5 shadow-sm">
          <p className="text-sm text-neutral-500">호출 진행</p>
          <p className="mt-1 text-3xl font-semibold text-amber-600">{summary.called}팀</p>
        </div>
        <div className="rounded-2xl bg-white/90 p-5 shadow-sm">
          <p className="text-sm text-neutral-500">완료</p>
          <p className="mt-1 text-3xl font-semibold text-emerald-600">{summary.done}팀</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white/90 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-600">Next Up</p>
        <p className="mt-1 text-lg font-semibold text-neutral-900">{summary.nextUp}</p>
        <div className="mt-4 space-y-2">
          {queues.length ? (
            queues.map((queue) => (
              <div
                key={queue.queue_id}
                className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3"
              >
                <div>
                  <p className="text-base font-semibold text-neutral-900">대기번호 {queue.queue_number}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(queue.created_at).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[queue.status]}`}>
                  {statusLabels[queue.status]}
                </span>
              </div>
            ))
          ) : (
            <p className="rounded-xl bg-neutral-100 py-6 text-center text-neutral-500">대기 팀이 없습니다.</p>
          )}
        </div>
      </div>
    </section>
  );
};
