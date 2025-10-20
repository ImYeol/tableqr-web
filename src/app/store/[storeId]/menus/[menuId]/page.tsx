import Link from "next/link";
import { notFound } from "next/navigation";

import { MenuImageGallery } from "@/components/features/store/MenuImageGallery";
import { MobileShell } from "@/components/ui/mobile-shell";
import { IconButton, iconButtonClassName } from "@/components/ui/icon-button";
import { ArrowLeftIcon, HeartIcon } from "@/components/ui/icons";
import { getMockMenu, getMockStore } from "@/mocks/store";
import type { Menu, Store } from "@/types";

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
    };
  } catch {
    return null;
  }
};

const fetchMenuDetail = async (
  storeId: number,
  menuId: number,
): Promise<{ store: Store; menu: Menu } | null> => {
  const store = getMockStore(storeId);
  const menu = getMockMenu(storeId, menuId);

  if (!menu) {
    return null;
  }

  return {
    store,
    menu,
  };
};

const parseIngredients = (description?: string | null) => {
  if (!description) {
    return [];
  }
  return description
    .split(/[\n,·]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .slice(0, 6);
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(value);

export const dynamic = "force-dynamic";

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

  const preloadedMenu = decodeMenuFromSearchParams(resolvedSearchParams?.menu);

  const detail = preloadedMenu
    ? {
        store: getMockStore(storeId),
        menu: preloadedMenu,
      }
    : await fetchMenuDetail(storeId, menuId);

  if (!detail) {
    notFound();
  }

  const { store, menu } = detail;

  const categoryLabel = menu.category?.trim()
    ? menu.category.trim()
    : menu.category_id != null
      ? `카테고리 ${menu.category_id}`
      : "추천 메뉴";
  const ingredients = parseIngredients(menu.description);
  const hasIngredients = ingredients.length > 0;
  const images = menu.image_url ? [{ src: menu.image_url, alt: `${menu.name} 이미지` }] : [];
  const summaryItems = [
    {
      label: "가격",
      value: formatCurrency(menu.price),
      description: "부가세 포함 · 변동 시 안내",
    },
  ];
  const description = menu.description ?? "메뉴 설명이 준비 중입니다.";

  return (
    <MobileShell contentClassName="flex flex-1 flex-col px-0">
      <section
        className="-mx-5"
        style={{ marginTop: "calc(-1 * var(--safe-top, 0px))" }}
      >
        <div className="relative mx-auto w-full max-w-[26.5rem]">
          <div className="relative aspect-[3/2] w-full overflow-hidden">
            <MenuImageGallery
              images={images}
              thumbnailSize="fluid"
              thumbnailVariant="flat"
              rounded={false}
              imageFit="contain"
            />
          </div>
          <header className="pointer-events-none absolute inset-0 z-10 flex items-start justify-between px-[var(--spacing-gutter)] pt-[calc(var(--safe-top,0px)+0.75rem)]">
            <Link
              href={`/store/${store.store_id}`}
              className={iconButtonClassName({
                variant: "ghost",
                size: "sm",
                className: "pointer-events-auto bg-black/35 text-white shadow-[0_14px_36px_-30px_rgba(0,0,0,0.45)] backdrop-blur",
              })}
              aria-label="매장으로 돌아가기"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
            <IconButton
              aria-label="즐겨찾기"
              variant="ghost"
              size="sm"
              className="pointer-events-auto bg-black/35 text-white shadow-[0_14px_36px_-30px_rgba(0,0,0,0.45)]"
            >
              <HeartIcon className="h-5 w-5" />
            </IconButton>
          </header>
        </div>
      </section>

      <section className="-mt-6 space-y-8 px-5 pb-16 pt-8">
        <div className="space-y-4">
          <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-brand-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
            {categoryLabel}
          </span>
          <div className="space-y-3">
            <h1 className="font-display text-3xl font-semibold">{menu.name}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <dl className="grid gap-6 sm:grid-cols-3">
          {summaryItems.map(({ label, value, description: meta }, index) => (
            <div key={`${label}-${index}`} className="space-y-2 border-b border-border-soft/60 pb-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground/90">{label}</dt>
              <dd className="text-lg font-semibold text-foreground">{value}</dd>
              {meta ? <p className="text-xs text-muted-foreground/80">{meta}</p> : null}
            </div>
          ))}
        </dl>

        {/* <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">구성 성분</h2>
            <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-surface-muted px-3 py-1 text-xs font-medium text-muted-foreground/80">
              {hasIngredients ? `${ingredients.length}가지` : "정보 준비 중"}
            </span>
          </div>

          {hasIngredients ? (
            <ul className="space-y-3">
              {ingredients.map((ingredient) => (
                <li
                  key={ingredient}
                  className="flex items-center justify-between border-b border-border-soft/60 pb-3 text-sm text-foreground"
                >
                  <span className="font-medium">{ingredient}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">Fresh</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-border-soft/70 bg-surface-muted/50 px-4 py-6 text-sm text-muted-foreground">
              구성 성분 정보가 준비 중입니다. 곧 업데이트될 예정입니다.
            </div>
          )}
        </div> */}
      </section>
    </MobileShell>
  );
};

export default MenuDetailPage;
