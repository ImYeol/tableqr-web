import { getInternalApiUrl } from "@/lib/server/getInternalApiUrl";
import type { StoreCachePayload } from "@/types";

export const fetchStoreCachePayload = async (storeId: number): Promise<StoreCachePayload | null> => {
  try {
    const response = await fetch(await getInternalApiUrl(`/api/cache/stores/${storeId}`), {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as StoreCachePayload;
  } catch {
    return null;
  }
};
