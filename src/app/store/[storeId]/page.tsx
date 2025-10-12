import { notFound } from "next/navigation";

import { MenuGrid } from "@/components/features/store/MenuGrid";
import { QueueBoard } from "@/components/features/store/QueueBoard";
import { StoreHero } from "@/components/features/store/StoreHero";
import { createSupabaseClient } from "@/lib/supabaseClient";
import type { Menu, Queue, Store } from "@/types";

type StorePageParams = {
  storeId: string;
};

const fetchStoreData = async (storeId: number) => {
  const supabase = createSupabaseClient();

  const [storeResponse, menuResponse, queueResponse] = await Promise.all([
    supabase
      .from("stores")
      .select("store_id, name, description, address, phone, logo_url, cover_url")
      .eq("store_id", storeId)
      .maybeSingle(),
    supabase
      .from("menus")
      .select("menu_id, store_id, name, description, price, image_url, is_active")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase
      .from("queues")
      .select("queue_id, store_id, queue_number, status, created_at, called_at")
      .eq("store_id", storeId)
      .order("queue_number", { ascending: true }),
  ]);

  if (storeResponse.error || !storeResponse.data) {
    return null;
  }

  return {
    store: storeResponse.data as Store,
    menus: (menuResponse.data as Menu[] | null) ?? [],
    queues: (queueResponse.data as Queue[] | null) ?? [],
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

  const { store, menus, queues } = result;

  return (
    <div className="min-h-screen bg-[#F9F7F3] pb-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 pt-10">
        <StoreHero store={store} />
        <MenuGrid menus={menus} />
        <QueueBoard initialQueues={queues} storeId={store.store_id} />
      </div>
    </div>
  );
};

export default StorePage;
