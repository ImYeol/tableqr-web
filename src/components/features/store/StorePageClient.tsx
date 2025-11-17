'use client';

import { useEffect, useRef, useState } from "react";
import { MobileStoreHeader } from "@/components/features/store/MobileStoreHeader";
import { MenuGrid } from "@/components/features/store/MenuGrid";
import { MobileActionBar } from "@/components/ui/mobile-action-bar";
import { MobileShell } from "@/components/ui/mobile-shell";
import { BellIcon, TicketIcon } from "@/components/ui/icons";
import { useOrderNumber } from "@/components/features/store/OrderNumberContext";
import { useStoreCache } from "@/hooks/useStoreCache";
import { formatQueueNumber } from "@/lib/formatQueueNumber";
import { useToast } from "@/components/ui/toast/ToastProvider";
import type { StoreCachePayload } from "@/types";
import type { WaitlistQueue } from "@/types/waitlist";

interface StorePageClientProps {
  storeId: number;
  initialData: StoreCachePayload;
  queueHref: string;
}

const WAITING_STATUS = 0;
const READY_STATUS = 1;

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
      return 2;
    default:
      return WAITING_STATUS;
  }
};

export const StorePageClient = ({ storeId, initialData, queueHref }: StorePageClientProps) => {
  const { data } = useStoreCache(storeId, initialData);
  const payload = data ?? initialData;
  const store = payload.store;
  const menus = payload.menus;
  const categories = payload.categories;
  const { orderNumber } = useOrderNumber();
  const { show } = useToast();
  const [readyNumbers, setReadyNumbers] = useState<number[]>([]);
  const [waitingNumbers, setWaitingNumbers] = useState<number[]>([]);
  const prevIsOrderReadyRef = useRef<boolean>(false);

  useEffect(() => {
    if (!orderNumber) {
      setReadyNumbers([]);
      setWaitingNumbers([]);
      return;
    }

    const fetchQueues = async () => {
      try {
        const response = await fetch(`/api/stores/${storeId}/queues`);
        if (response.ok) {
          const data = (await response.json()) as { queues: WaitlistQueue[] };
          const ready = data.queues
            .filter((q) => resolveStatusCode(q.status) === READY_STATUS)
            .map((q) => q.queue_number);
          const waiting = data.queues
            .filter((q) => resolveStatusCode(q.status) === WAITING_STATUS)
            .map((q) => q.queue_number);
          setReadyNumbers(ready);
          setWaitingNumbers(waiting);
        }
      } catch (error) {
        console.error("[StorePageClient] Failed to fetch queues", error);
      }
    };

    fetchQueues();
    const interval = setInterval(fetchQueues, 5000); // 5초마다 업데이트
    return () => clearInterval(interval);
  }, [storeId, orderNumber]);

  const isOrderReady = orderNumber != null && readyNumbers.includes(orderNumber);
  const isOrderWaiting = orderNumber != null && waitingNumbers.includes(orderNumber);

  // 준비 완료 상태로 변경될 때 Toast 표시
  useEffect(() => {
    const prevIsOrderReady = prevIsOrderReadyRef.current;
    if (!prevIsOrderReady && isOrderReady && orderNumber != null) {
      show({
        title: "주문 준비 완료",
        description: `주문번호 ${formatQueueNumber(orderNumber)}이(가) 준비되었습니다.`,
        durationMs: 5000,
      });
    }
    prevIsOrderReadyRef.current = isOrderReady;
  }, [isOrderReady, orderNumber, show]);

  const orderNumberDisplay = orderNumber != null ? (
    <div className="flex flex-col">
      <span>{formatQueueNumber(orderNumber)}</span>
    </div>
  ) : (
    <span className="text-base font-medium text-muted-foreground">주문번호 없음</span>
  );

  return (
    <MobileShell>
      <MobileStoreHeader
        store={store}
        operatingHours={store.business_hours ?? undefined}
        notice={store.notice ?? null}
      />
      <MenuGrid menus={menus} categories={categories} />
      <MobileActionBar
        totalLabel="주문번호"
        totalValue={orderNumberDisplay}
        totalIcon={
          <TicketIcon
            className={`h-5 w-5 ${isOrderReady ? "text-[var(--success)]" : "text-brand-700"}`}
          />
        }
        actionLabel={
          orderNumber != null
            ? isOrderReady
              ? "준비 완료"
              : isOrderWaiting
                ? "준비 중"
                : "주문 알림 등록"
            : "주문 알림 등록"
        }
        href={queueHref}
        actionIcon={<BellIcon className="h-4 w-4" />}
        className={
          isOrderReady
            ? "border-[var(--success)]/60 bg-[var(--success)]/25"
            : undefined
        }
      />
    </MobileShell>
  );
};
