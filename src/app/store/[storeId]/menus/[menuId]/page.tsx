import Link from "next/link";
import { notFound } from "next/navigation";

import { MenuImageCarousel } from "@/components/features/store/MenuImageCarousel";
import { buttonClassName } from "@/components/ui/button";
import { ArrowLeftIcon, HeartIcon } from "@/components/ui/icons";
import { createSupabaseClient } from "@/lib/supabaseClient";
import type { Menu, Store } from "@/types";

type MenuDetailPageParams = {
  storeId: string;
  menuId: string;
};

const fetchMenuDetail = async (storeId: number, menuId: number) => {
  const supabase = createSupabaseClient();

  const [storeResponse, menuResponse] = await Promise.all([
    supabase
      .from("stores")
      .select("store_id, name, cover_url")
      .eq("store_id", storeId)
      .maybeSingle(),
    supabase
      .from("menus")
      .select("menu_id, store_id, name, description, category:category_id, price, image_url, is_active")
      .eq("store_id", storeId)
      .eq("menu_id", menuId)
      .maybeSingle(),
  ]);

  if (storeResponse.error || !storeResponse.data || menuResponse.error || !menuResponse.data) {
    return null;
  }

  return {
    store: storeResponse.data as Store,
    menu: menuResponse.data as Menu,
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

const MenuDetailPage = async ({ params }: { params: Promise<MenuDetailPageParams> }) => {
  const { storeId: rawStoreId, menuId: rawMenuId } = await params;
  const storeId = Number(rawStoreId);
  const menuId = Number(rawMenuId);

  if (Number.isNaN(storeId) || Number.isNaN(menuId)) {
    notFound();
  }

  const detail = await fetchMenuDetail(storeId, menuId);

  if (!detail) {
    notFound();
  }

  const { store, menu } = detail;

  const categoryLabel =
    typeof menu.category === "string"
      ? menu.category.trim() || "추천 메뉴"
      : typeof menu.category === "number"
        ? `카테고리 ${menu.category}`
        : "추천 메뉴";
  const ingredients = parseIngredients(menu.description);
  const hasIngredients = ingredients.length > 0;
  const images = menu.image_url ? [{ src: menu.image_url, alt: `${menu.name} 이미지` }] : [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[320px] bg-gradient-to-b from-brand-200/50 via-brand-100/30 to-transparent blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 pb-16 pt-10 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between text-sm text-muted-foreground">
          <Link
            href={`/store/${store.store_id}`}
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-white/90 px-4 py-2 text-sm font-medium text-foreground shadow-[0_16px_32px_-28px_rgba(31,27,22,0.2)] transition-colors hover:bg-brand-50"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            매장으로 돌아가기
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-soft/70 bg-white text-brand-500 shadow-[0_18px_36px_-28px_rgba(31,27,22,0.26)] transition-transform hover:scale-105"
            aria-label="즐겨찾기"
          >
            <HeartIcon className="h-5 w-5" />
          </button>
        </header>

        <MenuImageCarousel images={images} />

        <section className="space-y-6 rounded-[calc(var(--radius-lg)+0.5rem)] border border-border-soft/60 bg-white/95 p-8 shadow-[0_40px_70px_-50px_rgba(31,27,22,0.35)]">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-[var(--radius-pill)] bg-brand-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
              {categoryLabel}
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">{menu.name}</h1>
              <p className="text-sm text-muted-foreground md:text-base">
                {menu.description ?? "메뉴 설명이 준비 중입니다."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-[var(--radius-card)] border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm text-brand-700">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-500/80">가격</p>
                <p className="mt-1 text-lg font-semibold">{formatCurrency(menu.price)}</p>
              </article>
              <article className="rounded-[var(--radius-card)] border border-border-soft/70 bg-surface px-4 py-3 text-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">준비 시간</p>
                <p className="mt-1 text-lg font-semibold text-foreground">약 30분</p>
              </article>
              <article className="rounded-[var(--radius-card)] border border-border-soft/70 bg-surface px-4 py-3 text-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">제공 인원</p>
                <p className="mt-1 text-lg font-semibold text-foreground">2-3인분</p>
              </article>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">구성 성분</h2>
              <span className="rounded-[var(--radius-pill)] bg-surface-muted px-3 py-1 text-xs text-muted-foreground/80">
                {hasIngredients ? `${ingredients.length}가지` : "정보 준비 중"}
              </span>
            </div>

            {hasIngredients ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {ingredients.map((ingredient) => (
                  <li
                    key={ingredient}
                    className="flex items-center justify-between rounded-[var(--radius-card)] border border-border-soft/60 bg-surface px-4 py-3 text-sm text-foreground shadow-[0_18px_36px_-30px_rgba(31,27,22,0.2)]"
                  >
                    <span className="font-medium">{ingredient}</span>
                    <span className="rounded-[var(--radius-pill)] bg-brand-50 px-3 py-1 text-xs text-brand-600">Fresh</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-[var(--radius-card)] border border-dashed border-border-soft/70 bg-surface-muted/50 px-6 py-8 text-sm text-muted-foreground">
                구성 성분 정보가 준비 중입니다. 곧 업데이트될 예정입니다.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border-soft/70 bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">준비되면 알림받기</p>
              <p className="text-xs text-muted-foreground/80">
                매장에 문의해 예약 주문을 하면 빠르게 맛볼 수 있어요.
              </p>
            </div>
            <Link
              href={`/store/${store.store_id}/waitlist`}
              className={buttonClassName({ variant: "primary", size: "sm", className: "px-6" })}
            >
              웨이팅 현황 보기
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MenuDetailPage;
