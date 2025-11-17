"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { useOrderNumber } from "@/components/features/store/OrderNumberContext";
import { buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatQueueNumber } from "@/lib/formatQueueNumber";
import { requestPermissionAndToken } from "@/lib/firebaseClient";
import type { WaitlistMutationMessage, WaitlistQueue, WaitlistStreamMessage } from "@/types/waitlist";

interface WaitlistClientBoardProps {
  storeId: number;
  initialQueues?: WaitlistQueue[];
}

const normalizeNumbers = (numbers: number[]) => Array.from(new Set(numbers)).sort((a, b) => a - b);

const WAITING_STATUS = 0;
const READY_STATUS = 1;
const SERVED_STATUS = 2;

const resolveStatusCode = (status: WaitlistQueue["status"]) => {
  if (typeof status === "number") {
    return status;
  }

  switch (status) {
    case "WAITING":
      return WAITING_STATUS;
    case "CALLED":
    case "DONE":
      return READY_STATUS;
    case "CANCELED":
      return SERVED_STATUS;
    default:
      return WAITING_STATUS;
  }
};

const extractNumbersByStatus = (queues: WaitlistQueue[], statusCode: number) =>
  normalizeNumbers(
    queues.filter((queue) => resolveStatusCode(queue.status) === statusCode).map((queue) => queue.queue_number),
  );

export const WaitlistClientBoard = ({ storeId, initialQueues = [] }: WaitlistClientBoardProps) => {
  const [waitingNumbers, setWaitingNumbers] = useState<number[]>(() => extractNumbersByStatus(initialQueues, WAITING_STATUS));
  const [readyNumbers, setReadyNumbers] = useState<number[]>(() => extractNumbersByStatus(initialQueues, READY_STATUS));
  const [inputValue, setInputValue] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [validationTone, setValidationTone] = useState<"info" | "success" | "error">("info");
  const [subscriptionState, setSubscriptionState] = useState<"idle" | "subscribed">("idle");
  const [notificationToken, setNotificationToken] = useState<string | null>(null);
  const [isRegisteringNotification, setIsRegisteringNotification] = useState(false);
  const { orderNumber, setOrderNumber } = useOrderNumber();

  const waitingSet = useMemo(() => new Set(waitingNumbers), [waitingNumbers]);
  const readySet = useMemo(() => new Set(readyNumbers), [readyNumbers]);

  const applySnapshot = useCallback(
    (queues: WaitlistQueue[]) => {
      const nextWaiting = extractNumbersByStatus(queues, WAITING_STATUS);
      const nextReady = extractNumbersByStatus(queues, READY_STATUS);
      const servedNumbers = new Set(
        queues
          .filter((queue) => resolveStatusCode(queue.status) === SERVED_STATUS)
          .map((queue) => queue.queue_number),
      );

      setWaitingNumbers(nextWaiting);
      setReadyNumbers(nextReady);

      if (servedNumbers.size > 0) {
        setOrderNumber((current) => {
          if (current != null && servedNumbers.has(current)) {
            setValidationTone("info");
            setValidationMessage(`주문 번호 ${formatQueueNumber(current)}가 완료되어 목록에서 제외됐어요.`);
            return null;
          }
          return current;
        });
      }
    },
    [setOrderNumber, setValidationMessage, setValidationTone],
  );

  const pruneQueueNumber = useCallback((queueNumber: number) => {
    setWaitingNumbers((current) => normalizeNumbers(current.filter((number) => number !== queueNumber)));
    setReadyNumbers((current) => normalizeNumbers(current.filter((number) => number !== queueNumber)));
  }, []);

  const applyMutation = useCallback(
    (mutation: WaitlistMutationMessage["data"]) => {
      const previousQueue = mutation.old ?? null;
      const nextQueue = mutation.new ?? null;
      const nextQueueNumber = nextQueue?.queue_number ?? null;

      if (!nextQueue) {
        return;
      }

      if (previousQueue && previousQueue.queue_number !== nextQueue.queue_number) {
        pruneQueueNumber(previousQueue.queue_number);
      }

      if (nextQueueNumber != null) {
        pruneQueueNumber(nextQueueNumber);
      }

      const statusCode = resolveStatusCode(nextQueue.status);

      if (statusCode === SERVED_STATUS || nextQueueNumber == null) {
        return;
      }

      if (statusCode === WAITING_STATUS) {
        setWaitingNumbers((current) => normalizeNumbers([...current, nextQueueNumber]));
        return;
      }

      if (statusCode === READY_STATUS) {
        setReadyNumbers((current) => normalizeNumbers([...current, nextQueueNumber]));
      }
    },
    [pruneQueueNumber],
  );

  useEffect(() => {
    applySnapshot(initialQueues);
  }, [applySnapshot, initialQueues]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let isUnmounted = false;

    const connect = () => {
      if (eventSource) {
        eventSource.close();
      }

      setSubscriptionState("idle");
      eventSource = new EventSource(`/api/stores/${storeId}/queues/stream`);

      eventSource.onopen = () => {
        setSubscriptionState("subscribed");
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as WaitlistStreamMessage;
          if (payload.type === "snapshot") {
            applySnapshot(payload.data);
          }
          if (payload.type === "mutation") {
            applyMutation(payload.data);
          }
        } catch {
          // no-op: ignore malformed event payloads
        }
      };

      eventSource.onerror = () => {
        if (isUnmounted) {
          return;
        }

        setSubscriptionState("idle");
        eventSource?.close();

        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
        }

        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [applyMutation, applySnapshot, storeId]);

  useEffect(() => {
    if (!orderNumber) {
      return;
    }

    if (readySet.has(orderNumber)) {
      setValidationTone("success");
      setValidationMessage(`주문 번호 ${formatQueueNumber(orderNumber)} 준비가 완료됐어요.`);
      return;
    }

    if (!waitingSet.has(orderNumber)) {
      setValidationTone("info");
      setValidationMessage("등록된 주문 번호가 목록에서 잠시 보이지 않아요.");
    }
  }, [orderNumber, readySet, waitingSet]);


  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = event.target.value.replace(/\D/g, "");
    setInputValue(digitsOnly);
    setValidationMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationMessage(null);

    if (isRegisteringNotification) {
      return;
    }

    const digitsOnly = inputValue.trim();

    if (!digitsOnly) {
      setOrderNumber(null);
      setValidationTone("error");
      setValidationMessage("주문 번호를 입력해 주세요.");
      return;
    }

    const parsed = Number.parseInt(digitsOnly, 10);
    if (!Number.isFinite(parsed)) {
      setOrderNumber(null);
      setValidationTone("error");
      setValidationMessage("숫자만 입력할 수 있어요.");
      return;
    }

    if (!waitingSet.has(parsed)) {
      setOrderNumber(null);
      setValidationTone("error");
      setValidationMessage("현재 준비 중인 주문 번호가 아니에요.");
      return;
    }

    setIsRegisteringNotification(true);

    try {
      let token = notificationToken;

      if (!token) {
        token = await requestPermissionAndToken();
        if (!token) {
          throw new Error("푸시 알림 권한을 허용해 주세요.");
        }
        setNotificationToken(token);
      }

      console.debug("[queue-notifications] registering", {
        storeId,
        queueNumber: parsed,
        tokenPreview: token ? `${token.slice(0, 8)}...` : null,
      });

      const response = await fetch(`/api/stores/${storeId}/queue-notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          queueNumber: parsed,
          fcmToken: token,
        }),
      });

      const debugText = await response.clone().text().catch(() => "<no-body>");
      console.debug("[queue-notifications] response", { status: response.status, body: debugText });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string; details?: string; code?: string } | null;
        throw new Error(payload?.error ?? "알림 등록에 실패했어요.");
      }

      setOrderNumber(parsed);
      setValidationTone("success");
      setValidationMessage(`주문 번호 ${formatQueueNumber(parsed)} 알림을 등록했어요.`);
    } catch (error) {
      console.error("[queue-notifications] register error", error);
      setOrderNumber(null);
      setValidationTone("error");
      setValidationMessage(error instanceof Error ? error.message : "알림 등록 중 문제가 발생했어요.");
    } finally {
      setIsRegisteringNotification(false);
    }
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
              const isSubscribed = orderNumber === number;
              return (
                <li
                  key={`${title}-${number}`}
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${
                    isSubscribed ? "bg-brand-600 text-white" : circleClassName
                  }`}
                >
                  {formatQueueNumber(number)}
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

  const isOrderReady = orderNumber != null && readySet.has(orderNumber);
  const formStateClassName =
    orderNumber != null
      ? isOrderReady
        ? "border-[var(--success)]/40 bg-[var(--success)]/20 ring-2 ring-[var(--success)]/30 ring-offset-2 ring-offset-[var(--color-background)]"
        : "border-brand-100 bg-brand-50/70"
      : "border-danger/40 bg-danger/5 ring-2 ring-danger/20 ring-offset-2 ring-offset-[var(--color-background)]";

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className={`relative space-y-4 rounded-[var(--radius-lg)] px-5 py-6 shadow-[0_20px_56px_-40px_rgba(31,27,22,0.28)] transition-all ${formStateClassName}`}
      >
        <div className="flex items-center justify-between gap-3">
          <span
            id="queue-number-label"
            className={`text-base font-semibold ${orderNumber != null ? "text-brand-700" : "text-danger"}`}
          >
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
        <div className="flex items-center gap-2">
          <Input
            id="queue-number-input"
            value={inputValue}
            onChange={handleInputChange}
            inputMode="numeric"
            placeholder="주문 번호 입력"
            aria-labelledby="queue-number-label queue-number-helper"
            aria-invalid={validationTone === "error"}
            type="tel"
            className="min-w-0 flex-1"
          />
          <button
            type="submit"
            disabled={isRegisteringNotification}
            className={buttonClassName({
              variant: "primary",
              size: "sm",
              className: "flex-none px-5",
            })}
          >
            확인
          </button>
        </div>
        <p id="queue-number-helper" className="text-xs text-muted-foreground">
          준비 중인 주문 번호만 등록할 수 있어요. 번호는 숫자만 입력해 주세요.
        </p>
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
      </form>
      {renderTicketList("준비 완료", readyNumbers, "bg-success/15 text-success")}
      {renderTicketList("준비 중", waitingNumbers, "bg-brand-50 text-brand-600")}
    </div>
  );
};
