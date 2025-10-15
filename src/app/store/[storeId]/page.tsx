import { notFound } from "next/navigation";

import { StorePageClient } from "@/components/features/store/StorePageClient";
import { getMockMenus, getMockStore } from "@/mocks/store";
import type { Menu, Store } from "@/types";

type StorePageParams = {
  storeId: string;
};

const fetchStoreData = async (storeId: number): Promise<{ store: Store; menus: Menu[] }> => {
  const store = getMockStore(storeId);
  const menus = getMockMenus(storeId).filter((menu) => menu.is_active);

  return {
    store,
    menus,
  };
};

export const dynamic = "force-dynamic";

const StorePage = async ({ params }: { params: Promise<StorePageParams> }) => {
  const { storeId: rawStoreId } = await params;
  const storeId = Number(rawStoreId);

  if (Number.isNaN(storeId)) {
    notFound();
  }

  const result = await fetchStoreData(storeId);

  if (!result) {
    notFound();
  }

  const { store, menus } = result;
  const queueHref = `/store/${store.store_id}/waitlist`;

  return <StorePageClient store={store} menus={menus} queueHref={queueHref} />;
};

export default StorePage;
