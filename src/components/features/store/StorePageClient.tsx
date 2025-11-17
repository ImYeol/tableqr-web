'use client';

import { MobileStoreHeader } from "@/components/features/store/MobileStoreHeader";
import { MenuGrid } from "@/components/features/store/MenuGrid";
import { MobileActionBar } from "@/components/ui/mobile-action-bar";
import { MobileShell } from "@/components/ui/mobile-shell";
import { BellIcon, TicketIcon } from "@/components/ui/icons";
import { useOrderNumber } from "@/components/features/store/OrderNumberContext";
import { useStoreCache } from "@/hooks/useStoreCache";
import { formatQueueNumber } from "@/lib/formatQueueNumber";
import type { StoreCachePayload } from "@/types";

interface StorePageClientProps {
  storeId: number;
  initialData: StoreCachePayload;
  queueHref: string;
}

export const StorePageClient = ({ storeId, initialData, queueHref }: StorePageClientProps) => {
  const { data } = useStoreCache(storeId, initialData);
  const payload = data ?? initialData;
  const store = payload.store;
  const menus = payload.menus;
  const categories = payload.categories;
  const { orderNumber } = useOrderNumber();

  const orderNumberDisplay = orderNumber != null ? (
    formatQueueNumber(orderNumber)
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
        totalIcon={<TicketIcon className="h-5 w-5 text-brand-700" />}
        actionLabel="주문 알림 등록"
        href={queueHref}
        actionIcon={<BellIcon className="h-4 w-4" />}
      />
    </MobileShell>
  );
};
