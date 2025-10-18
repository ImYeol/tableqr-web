'use client';

import { useMemo, useState } from "react";

import { MobileStoreHeader } from "@/components/features/store/MobileStoreHeader";
import { MenuGrid } from "@/components/features/store/MenuGrid";
import { MobileActionBar } from "@/components/ui/mobile-action-bar";
import { MobileShell } from "@/components/ui/mobile-shell";
import { ShoppingBagIcon } from "@/components/ui/icons";
import type { Menu, MenuCategory, Store } from "@/types";

const currencyFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

interface StorePageClientProps {
  store: Store;
  menus: Menu[];
  categories: MenuCategory[];
  queueHref: string;
}

export const StorePageClient = ({ store, menus, categories, queueHref }: StorePageClientProps) => {
  const [cartTotal, setCartTotal] = useState(0);

  const handleAddToCart = (menu: Menu) => {
    setCartTotal((prev) => prev + menu.price);
  };

  const formattedTotal = useMemo(() => currencyFormatter.format(cartTotal), [cartTotal]);

  return (
    <MobileShell>
      <MobileStoreHeader
        store={store}
        backHref="/"
        operatingHours={store.business_hours ?? undefined}
        notice={store.notice ?? null}
      />
      <MenuGrid menus={menus} categories={categories} onAddToCart={handleAddToCart} />
      <MobileActionBar
        totalLabel="총 가격"
        totalValue={formattedTotal}
        totalIcon={<ShoppingBagIcon className="h-5 w-5 text-brand-700" />}
        actionLabel="웨이팅 현황"
        href={queueHref}
      />
    </MobileShell>
  );
};
