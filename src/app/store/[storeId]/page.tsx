import { notFound } from "next/navigation";

import { StorePageClient } from "@/components/features/store/StorePageClient";
import { fetchStoreCachePayload } from "@/lib/server/fetchStoreCachePayload";

export const revalidate = 600; // revalidate every 10 minutes

type StorePageParams = {
  storeId: string;
};

const StorePage = async ({ params }: { params: Promise<StorePageParams> }) => {
  const { storeId: rawStoreId } = await params;
  const storeId = Number(rawStoreId);

  if (Number.isNaN(storeId)) {
    notFound();
  }

  const result = await fetchStoreCachePayload(storeId);
  
  if (!result) {
    notFound();
  }

  const queueHref = `/store/${result.store.store_id}/waitlist`;

  return <StorePageClient storeId={result.store.store_id} initialData={result} queueHref={queueHref} />;
};

export default StorePage;
