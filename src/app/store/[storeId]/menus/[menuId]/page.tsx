import { notFound } from "next/navigation";

import { MenuDetailClient } from "@/components/features/store/MenuDetailClient";
import { fetchStoreCachePayload } from "@/lib/server/fetchStoreCachePayload";
import { fetchMockStoreData } from "@/lib/server/store-data/getStoreData";
import type { Menu, StoreCachePayload } from "@/types";
export const revalidate = 600; // revalidate every 10 minutes

type MenuDetailPageParams = {
  storeId: string;
  menuId: string;
};

const decodeMenuFromSearchParams = (raw?: string | string[]): Menu | null => {
  if (!raw || Array.isArray(raw)) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeURIComponent(raw)) as Partial<Menu>;

    if (!payload || typeof payload !== "object") {
      return null;
    }

    const menuId = Number(payload.menu_id);
    const storeId = Number(payload.store_id);

    if (!Number.isFinite(menuId) || !Number.isFinite(storeId)) {
      return null;
    }

    return {
      menu_id: menuId,
      store_id: storeId,
      name: typeof payload.name === "string" ? payload.name : "메뉴",
      description: typeof payload.description === "string" ? payload.description : null,
      price: Number(payload.price ?? 0),
      image_url: typeof payload.image_url === "string" ? payload.image_url : null,
      is_active: payload.is_active !== false,
      category_id: payload.category_id != null ? Number(payload.category_id) : null,
      category: typeof payload.category === "string" ? payload.category : null,
      allergy_info: Array.isArray(payload.allergy_info)
        ? payload.allergy_info.filter((item): item is string => typeof item === "string")
        : null,
      display_order: Number(payload.display_order ?? 0),
      updated_at: typeof payload.updated_at === "string" ? payload.updated_at : null,
    };
  } catch {
    return null;
  }
};

const buildLocalFallback = async (storeId: number): Promise<StoreCachePayload> => {
  const mockData = await fetchMockStoreData(storeId);

  return {
    ...mockData,
    cachedAt: new Date().toISOString(),
    source: "mock",
  };
};

const MenuDetailPage = async ({
  params,
  searchParams,
}: {
  params: Promise<MenuDetailPageParams>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const [{ storeId: rawStoreId, menuId: rawMenuId }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const storeId = Number(rawStoreId);
  const menuId = Number(rawMenuId);

  if (Number.isNaN(storeId) || Number.isNaN(menuId)) {
    notFound();
  }

  const [cachedData, preloadedMenu] = await Promise.all([
    fetchStoreCachePayload(storeId),
    Promise.resolve(decodeMenuFromSearchParams(resolvedSearchParams?.menu)),
  ]);

  const normalizedPreloadedMenu = preloadedMenu && preloadedMenu.store_id === storeId ? preloadedMenu : null;

  const hydratedData = cachedData ?? (await buildLocalFallback(storeId));
  const initialMenu = hydratedData.menus.find((menu) => menu.menu_id === menuId) ?? normalizedPreloadedMenu;

  if (!initialMenu) {
    notFound();
  }

  return (
    <MenuDetailClient
      storeId={storeId}
      menuId={menuId}
      initialMenu={initialMenu}
      fallbackStore={hydratedData.store}
      initialStoreData={cachedData ?? undefined}
    />
  );
};

export default MenuDetailPage;
