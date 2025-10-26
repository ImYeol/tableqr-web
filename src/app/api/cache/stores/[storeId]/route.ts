import { NextResponse } from "next/server";

import { fetchMockStoreData, fetchStoreDataFromSupabase } from "@/lib/server/store-data/getStoreData";
import type { StoreCachePayload } from "@/types";

const EDGE_CACHE_SECONDS = 600;
const BROWSER_CACHE_SECONDS = 300;

export const runtime = "edge";
export const revalidate = 600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ storeId: string }> },
): Promise<NextResponse<StoreCachePayload | { error: string }>> {
  const { storeId: rawStoreId } = await params;
  const storeId = Number(rawStoreId);

  if (!Number.isFinite(storeId)) {
    return NextResponse.json({ error: "Invalid store id" }, { status: 400 });
  }

  const liveData = await fetchStoreDataFromSupabase(storeId);
  const storeData = liveData ?? (await fetchMockStoreData(storeId));

  if (!storeData) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const payload: StoreCachePayload = {
    ...storeData,
    cachedAt: new Date().toISOString(),
    source: liveData ? "supabase" : "mock",
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": `public, max-age=${BROWSER_CACHE_SECONDS}, s-maxage=${EDGE_CACHE_SECONDS}, stale-while-revalidate=60`,
    },
  });
}
