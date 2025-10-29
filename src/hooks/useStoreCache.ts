'use client';

import useSWR from "swr";
import { FETCH_CACHE_MODE, SWR_DEDUPE_MS } from "@/config";

import type { StoreCachePayload } from "@/types";

const fetcher = async (url: string): Promise<StoreCachePayload> => {
  console.log("Fetching store cache from", url);
  const response = await fetch(url, {
    cache: FETCH_CACHE_MODE,
  });

  if (!response.ok) {
    throw new Error("Failed to load store cache");
  }

  return (await response.json()) as StoreCachePayload;
};

export const useStoreCache = (storeId: number | null, fallbackData?: StoreCachePayload) =>
  useSWR<StoreCachePayload>(storeId ? `/api/cache/stores/${storeId}` : null, fetcher, {
    fallbackData,
    dedupingInterval: SWR_DEDUPE_MS,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });
