"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { buttonClassName } from "@/components/ui/button";
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
  WAITING: "border-brand-200/70 bg-brand-50 text-brand-600",
  CALLED: "border-warning/40 bg-warning/10 text-warning",
  DONE: "border-success/40 bg-success/15 text-success",
  CANCELED: "border-danger/40 bg-danger/10 text-danger",
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
    <section id="waitlist" className="space-y-6 rounded-[var(--radius-lg)] border border-border-soft/70 bg-surface p-6 shadow-[0_24px_54px_-36px_rgba(31,27,22,0.28)] md:p-8">
      <header className="flex flex-col gap-4 border-b border-border-soft/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">Live Queue</p>
          <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">실시간 대기 현황</h2>
          <p className="text-sm text-muted-foreground">
            지금 입장 가능한 팀과 예상 대기 시간을 확인하고 여유롭게 준비하세요.
          </p>
        </div>
        <Link href="#waitlist" className={buttonClassName({ variant: "ghost", size: "sm", className: "text-brand-600" })}>
          대기 목록 페이지로 이동
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2 rounded-[var(--radius-card)] bg-brand-500 text-white shadow-[0_24px_46px_-32px_rgba(255,122,59,0.6)]">
          <div className="rounded-t-[var(--radius-card)] bg-white/15 px-5 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
            Next Up
          </div>
          <div className="px-5 pb-6">
            <p className="text-2xl font-semibold tracking-tight">{summary.nextUp}</p>
            <p className="mt-2 text-sm text-white/80">호출 시 매장 화면과 문자로 동시에 안내됩니다.</p>
          </div>
        </div>
        <div className="rounded-[var(--radius-card)] border border-border-soft/60 bg-surface-muted/60 p-5">
          <p className="text-sm text-muted-foreground/80">현재 대기 팀</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{summary.waiting}팀</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-border-soft/60 bg-surface-muted/40 p-5">
          <p className="text-sm text-muted-foreground/80">호출 진행</p>
          <p className="mt-1 text-3xl font-semibold text-brand-600">{summary.called}팀</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-border-soft/60 bg-surface-muted/40 p-5">
          <p className="text-sm text-muted-foreground/80">완료</p>
          <p className="mt-1 text-3xl font-semibold text-success">{summary.done}팀</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p className="font-medium text-foreground">실시간 대기 팀 목록</p>
          <span className="rounded-[var(--radius-pill)] bg-surface-muted px-3 py-1 text-xs">
            총 {queues.length}팀이 등록되어 있어요
          </span>
        </div>
        <div className="space-y-3">
          {queues.length ? (
            queues.map((queue) => (
              <div
                key={queue.queue_id}
                className="flex items-center justify-between rounded-[var(--radius-card)] border border-border-soft/70 bg-surface-muted/60 px-5 py-4 shadow-[0_18px_34px_-32px_rgba(31,27,22,0.25)]"
              >
                <div>
                  <p className="text-base font-semibold text-foreground">대기번호 {queue.queue_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(queue.created_at).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 rounded-[var(--radius-pill)] border px-3 py-1 text-xs font-semibold ${statusStyles[queue.status]}`}
                >
                  {statusLabels[queue.status]}
                </span>
              </div>
            ))
          ) : (
            <p className="rounded-[var(--radius-card)] border border-dashed border-border-soft/70 bg-surface-muted/40 py-8 text-center text-muted-foreground">
              대기 팀이 없습니다. 첫 번째로 웨이팅을 등록해 보세요!
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
