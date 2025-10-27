import { notFound } from "next/navigation";

import { StorePageClient } from "@/components/features/store/StorePageClient";
import { fetchStoreCachePayload } from "@/lib/server/fetchStoreCachePayload";
import { fetchMockStoreData } from "@/lib/server/store-data/getStoreData";
import type { StoreCachePayload } from "@/types";
import { DYNAMIC_MODE, REVALIDATE_SECONDS } from "@/config";

export const revalidate = REVALIDATE_SECONDS; // centralized cache control

type StorePageParams = {
  storeId: string;
};

const buildLocalFallback = async (storeId: number): Promise<StoreCachePayload> => {
  const mockData = await fetchMockStoreData(storeId);

  return {
    ...mockData,
    cachedAt: new Date().toISOString(),
    source: "mock",
  };
};

export const dynamic = DYNAMIC_MODE;

const StorePage = async ({ params }: { params: Promise<StorePageParams> }) => {
  const { storeId: rawStoreId } = await params;
  const storeId = Number(rawStoreId);

  if (Number.isNaN(storeId)) {
    notFound();
  }

  const result = (await fetchStoreCachePayload(storeId)) ?? (await buildLocalFallback(storeId));

  const queueHref = `/store/${result.store.store_id}/waitlist`;

  return <StorePageClient storeId={result.store.store_id} initialData={result} queueHref={queueHref} />;
};

export default StorePage;
