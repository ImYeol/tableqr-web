import { notFound } from "next/navigation";

import { MenuGrid } from "@/components/features/store/MenuGrid";
import { StoreHero } from "@/components/features/store/StoreHero";
import { createSupabaseClient } from "@/lib/supabaseClient";
import type { Menu, Store } from "@/types";

type StorePageParams = {
  storeId: string;
};

const fetchStoreData = async (storeId: number) => {
  const supabase = createSupabaseClient();

  const [storeResponse, menuResponse] = await Promise.all([
    supabase
      .from("stores")
      .select("store_id, name, description, address, phone, logo_url, cover_url")
      .eq("store_id", storeId)
      .maybeSingle(),
    supabase
      .from("menus")
      .select("menu_id, store_id, name, description, category:category_id, price, image_url, is_active")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  if (storeResponse.error || !storeResponse.data) {
    return null;
  }

  return {
    store: storeResponse.data as Store,
    menus: (menuResponse.data as Menu[] | null) ?? [],
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-50 via-[#f9f6f1] to-white pb-24">
      <div className="pointer-events-none absolute inset-x-0 top-[-120px] h-[360px] rounded-b-[70%] bg-gradient-to-b from-brand-200/40 via-brand-100/30 to-transparent blur-3xl" />
      <div className="relative mx-auto flex w-full flex-col gap-12 px-6 pt-12">
        <StoreHero store={store} menuCount={menus.length} queueHref={queueHref} />
        <MenuGrid menus={menus} />
      </div>
    </div>
  );
};

export default StorePage;
