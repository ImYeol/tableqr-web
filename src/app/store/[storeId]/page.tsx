import { notFound } from "next/navigation";

import { StorePageClient } from "@/components/features/store/StorePageClient";
import { getMockMenus, getMockStore } from "@/mocks/store";
import { createSupabaseClient } from "@/lib/supabaseClient";
import type { Menu, MenuCategory, Store } from "@/types";

type StorePageParams = {
  storeId: string;
};

const fetchMockStoreData = async (
  storeId: number,
): Promise<{ store: Store; menus: Menu[]; categories: MenuCategory[] }> => {
  const store = getMockStore(storeId);
  const menus = getMockMenus(storeId).filter((menu) => menu.is_active);
  const categoryMap = new Map<string, MenuCategory>();
  let fallbackCategoryId = -1;

  menus.forEach((menu, index) => {
    const label = menu.category ?? "시그니처";

    const key = menu.category_id != null ? `id:${menu.category_id}` : `label:${label}`;
    if (!categoryMap.has(key)) {
      const resolvedCategoryId = menu.category_id ?? fallbackCategoryId;
      categoryMap.set(key, {
        category_id: resolvedCategoryId,
        store_id: storeId,
        name: label,
        description: null,
        display_order: menu.display_order ?? index,
      });
      if (menu.category_id == null) {
        fallbackCategoryId -= 1;
      }
      return;
    }

    const existing = categoryMap.get(key);
    if (existing) {
      existing.display_order = Math.min(existing.display_order, menu.display_order ?? index);
    }
  });

  return {
    store,
    menus: menus.map((menu, index) => ({
      ...menu,
      display_order: menu.display_order ?? index,
    })),
    categories: Array.from(categoryMap.values()).sort((a, b) => a.display_order - b.display_order),
  };
};

const fetchStoreData = async (
  storeId: number,
): Promise<{ store: Store; menus: Menu[]; categories: MenuCategory[] } | null> => {
  const supabase = createSupabaseClient();

  const { data: storeRow, error: storeError } = await supabase
    .from("stores")
    .select(
      "store_id, name, description, address, phone, logo_url, cover_url, business_hours, notice",
    )
    .eq("store_id", storeId)
    .limit(1)
    .maybeSingle();

  if (storeError || !storeRow) {
    return null;
  }

  const { data: categoryRows, error: categoryError } = await supabase
    .from("categories")
    .select("category_id, store_id, name, description, display_order")
    .eq("store_id", storeId)
    .order("display_order", { ascending: true, nullsFirst: true })
    .order("category_id", { ascending: true });

  if (categoryError) {
    return null;
  }

  const categories: MenuCategory[] =
    categoryRows?.map((category, index) => ({
      category_id: Number(category.category_id),
      store_id: Number(category.store_id ?? storeId),
      name: category.name ?? `카테고리 ${index + 1}`,
      description: category.description ?? null,
      display_order: category.display_order ?? index,
    })) ?? [];

  const categoryLookup = new Map<number, MenuCategory>(categories.map((category) => [category.category_id, category]));

  const { data: menuRows, error: menuError } = await supabase
    .from("menus")
    .select(
      "menu_id, store_id, name, description, price, image_url, is_active, category_id, allergy_info, display_order",
    )
    .eq("store_id", storeId)
    .eq("is_active", true)
    .order("display_order", { ascending: true, nullsFirst: true })
    .order("menu_id", { ascending: true });

  if (menuError) {
    return null;
  }

  const menus: Menu[] =
    menuRows?.map((menu, index) => {
      const categoryId = menu.category_id != null ? Number(menu.category_id) : null;
      const category = categoryId != null ? categoryLookup.get(categoryId) : null;

      return {
        menu_id: Number(menu.menu_id),
        store_id: Number(menu.store_id ?? storeId),
        name: menu.name ?? "메뉴",
        description: menu.description ?? null,
        price: Number(menu.price ?? 0),
        image_url: menu.image_url ?? null,
        is_active: Boolean(menu.is_active ?? true),
        category_id: categoryId,
        category: category?.name ?? null,
        allergy_info: Array.isArray(menu.allergy_info) ? menu.allergy_info : null,
        display_order: menu.display_order ?? index,
      };
    }) ?? [];

  const normalizedStore: Store = {
    store_id: Number(storeRow.store_id),
    name: storeRow.name ?? "매장 정보 준비 중",
    description: storeRow.description ?? null,
    address: storeRow.address ?? null,
    phone: storeRow.phone ?? null,
    logo_url: storeRow.logo_url ?? null,
    cover_url: storeRow.cover_url ?? null,
    business_hours: storeRow.business_hours ?? null,
    notice: storeRow.notice ?? null,
  };

  return {
    store: normalizedStore,
    menus,
    categories,
  };
};

export const dynamic = "force-dynamic";

const StorePage = async ({ params }: { params: Promise<StorePageParams> }) => {
  const { storeId: rawStoreId } = await params;
  const storeId = Number(rawStoreId);

  if (Number.isNaN(storeId)) {
    notFound();
  }

  const result = (await fetchStoreData(storeId)) ?? (await fetchMockStoreData(storeId));

  if (!result) {
    notFound();
  }

  const { store, menus, categories } = result;
  const queueHref = `/store/${store.store_id}/waitlist`;

  return <StorePageClient store={store} menus={menus} categories={categories} queueHref={queueHref} />;
};

export default StorePage;
