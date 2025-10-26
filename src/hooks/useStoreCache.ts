'use client';

import useSWR from "swr";

import type { StoreCachePayload } from "@/types";

const fetcher = async (url: string): Promise<StoreCachePayload> => {
  console.log("Fetching store cache from", url);
  const response = await fetch(url, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("Failed to load store cache");
  }

  return (await response.json()) as StoreCachePayload;
};

export const useStoreCache = (storeId: number | null, fallbackData?: StoreCachePayload) =>
  useSWR<StoreCachePayload>(storeId ? `/api/cache/stores/${storeId}` : null, fetcher, {
    fallbackData,
    dedupingInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });
