"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBrowserSupabaseClient } from "@/lib/supabaseClient";
import type { Queue } from "@/types";

type WaitlistQueue = Pick<Queue, "queue_id" | "queue_number" | "status">;

interface WaitlistClientBoardProps {
  storeId: number;
  initialQueues: WaitlistQueue[];
}

const normalizeNumbers = (numbers: number[]) => Array.from(new Set(numbers)).sort((a, b) => a - b);
const formatTicketNumber = (value: number) => value.toString().padStart(2, "0");

export const WaitlistClientBoard = ({ storeId, initialQueues }: WaitlistClientBoardProps) => {
  const [waitingNumbers, setWaitingNumbers] = useState<number[]>(() =>
    normalizeNumbers(initialQueues.filter((queue) => queue.status === "WAITING").map((queue) => queue.queue_number)),
  );
  const [readyNumbers, setReadyNumbers] = useState<number[]>(() =>
    normalizeNumbers(initialQueues.filter((queue) => queue.status === "DONE").map((queue) => queue.queue_number)),
  );
  const [inputValue, setInputValue] = useState("");
  const [subscribedNumber, setSubscribedNumber] = useState<number | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [validationTone, setValidationTone] = useState<"info" | "success" | "error">("info");
  const [subscriptionState, setSubscriptionState] = useState<"idle" | "subscribed">("idle");

  const waitingSet = useMemo(() => new Set(waitingNumbers), [waitingNumbers]);
  const readySet = useMemo(() => new Set(readyNumbers), [readyNumbers]);

  useEffect(() => {
    setWaitingNumbers(
      normalizeNumbers(initialQueues.filter((queue) => queue.status === "WAITING").map((queue) => queue.queue_number)),
    );
    setReadyNumbers(
      normalizeNumbers(initialQueues.filter((queue) => queue.status === "DONE").map((queue) => queue.queue_number)),
    );
  }, [initialQueues]);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    const channel = supabase
      .channel(`waitlist-store-${storeId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queues", filter: `store_id=eq.${storeId}` },
        (payload) => {
          const nextQueue = (payload.new as Queue | null) ?? null;
          const previousQueue = (payload.old as Queue | null) ?? null;

          if (payload.eventType === "DELETE" && previousQueue) {
            if (previousQueue.status === "WAITING") {
              setWaitingNumbers((current) =>
                normalizeNumbers(current.filter((number) => number !== previousQueue.queue_number)),
              );
            }
            if (previousQueue.status === "DONE") {
              setReadyNumbers((current) =>
                normalizeNumbers(current.filter((number) => number !== previousQueue.queue_number)),
              );
            }
            return;
          }

          if (!nextQueue) {
            return;
          }

          setWaitingNumbers((current) => {
            const withoutCurrent = current.filter((number) => number !== nextQueue.queue_number);
            if (nextQueue.status === "WAITING") {
              return normalizeNumbers([...withoutCurrent, nextQueue.queue_number]);
            }
            return normalizeNumbers(withoutCurrent);
          });

          setReadyNumbers((current) => {
            const withoutCurrent = current.filter((number) => number !== nextQueue.queue_number);
            if (nextQueue.status === "DONE") {
              return normalizeNumbers([...withoutCurrent, nextQueue.queue_number]);
            }
            return normalizeNumbers(withoutCurrent);
          });
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setSubscriptionState("subscribed");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId]);

  useEffect(() => {
    if (!subscribedNumber) {
      return;
    }

    if (readySet.has(subscribedNumber)) {
      setValidationTone("success");
      setValidationMessage(`주문 번호 ${formatTicketNumber(subscribedNumber)} 준비가 완료됐어요.`);
      return;
    }

    if (!waitingSet.has(subscribedNumber)) {
      setValidationTone("info");
      setValidationMessage("등록된 주문 번호가 목록에서 잠시 보이지 않아요.");
    }
  }, [readySet, waitingSet, subscribedNumber]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = event.target.value.replace(/\D/g, "");
    setInputValue(digitsOnly);
    setValidationMessage(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const digitsOnly = inputValue.trim();

    if (!digitsOnly) {
      setSubscribedNumber(null);
      setValidationTone("error");
      setValidationMessage("주문 번호를 입력해 주세요.");
      return;
    }

    const parsed = Number.parseInt(digitsOnly, 10);
    if (!Number.isFinite(parsed)) {
      setSubscribedNumber(null);
      setValidationTone("error");
      setValidationMessage("숫자만 입력할 수 있어요.");
      return;
    }

    if (!waitingSet.has(parsed)) {
      setSubscribedNumber(null);
      setValidationTone("error");
      setValidationMessage("현재 준비 중인 주문 번호가 아니에요.");
      return;
    }

    setSubscribedNumber(parsed);
    setValidationTone("success");
    setValidationMessage(`주문 번호 ${formatTicketNumber(parsed)} 알림을 등록했어요.`);
  };

  const renderTicketList = (title: string, numbers: number[], circleClassName: string) => (
    <article className="space-y-5 rounded-[var(--radius-lg)] bg-surface px-5 py-6 shadow-[0_20px_56px_-40px_rgba(31,27,22,0.28)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <span className="text-xs font-medium text-muted-foreground">{numbers.length ? `${numbers.length}건` : "0건"}</span>
      </div>
      {numbers.length ? (
        <div className="max-h-[24rem] min-h-[12rem] overflow-y-auto pr-1">
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {numbers.map((number) => {
              const isSubscribed = subscribedNumber === number;
              return (
                <li
                  key={`${title}-${number}`}
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-base font-semibold ${circleClassName} ${
                    isSubscribed ? "ring-2 ring-brand-400 ring-offset-2 ring-offset-[var(--color-background)]" : ""
                  }`}
                >
                  {formatTicketNumber(number)}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="min-h-[6rem] rounded-[var(--radius-lg)] bg-surface-muted px-4 py-6 text-sm text-muted-foreground">
          현재 번호가 없습니다.
        </p>
      )}
    </article>
  );

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-[var(--radius-lg)] bg-surface px-5 py-6 shadow-[0_20px_56px_-40px_rgba(31,27,22,0.28)]"
      >
        <div className="flex items-center justify-between gap-3">
          <span id="queue-number-label" className="text-sm font-medium text-foreground">
            내 주문 번호
          </span>
          <span
            className={`inline-flex items-center rounded-[var(--radius-pill)] px-3 py-1 text-xs font-semibold ${
              subscriptionState === "subscribed" ? "bg-success/15 text-success" : "bg-surface-muted text-muted-foreground"
            }`}
          >
            {subscriptionState === "subscribed" ? "실시간 업데이트 중" : "연결 설정 중"}
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            id="queue-number-input"
            value={inputValue}
            onChange={handleInputChange}
            inputMode="numeric"
            placeholder="주문 번호 입력"
            aria-labelledby="queue-number-label queue-number-helper"
            aria-invalid={validationTone === "error"}
            type="tel"
            className="flex-1"
          />
          <button
            type="submit"
            className={buttonClassName({ variant: "primary", size: "sm", className: "shrink-0 px-4" })}
          >
            확인
          </button>
        </div>
        <p id="queue-number-helper" className="text-xs text-muted-foreground">
          준비 중인 주문 번호만 등록할 수 있어요. 번호는 숫자만 입력해 주세요.
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-[var(--radius-pill)] bg-surface-muted px-4 py-2 text-xs text-muted-foreground">
            <span>알림 등록 번호</span>
            <span className="text-sm font-semibold text-foreground">
              {subscribedNumber ? formatTicketNumber(subscribedNumber) : "등록되지 않음"}
            </span>
          </div>
          {validationMessage ? (
            <p
              role="status"
              className={`text-xs ${
                validationTone === "error" ? "text-danger" : validationTone === "success" ? "text-success" : "text-muted-foreground"
              }`}
            >
              {validationMessage}
            </p>
          ) : null}
        </div>
      </form>
      {renderTicketList("준비 완료", readyNumbers, "bg-success/15 text-success")}
      {renderTicketList("준비 중", waitingNumbers, "bg-brand-50 text-brand-600")}
    </div>
  );
};
