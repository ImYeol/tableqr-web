'use client';

import Link from "next/link";
import { useMemo, useState } from "react";

import { iconButtonClassName } from "@/components/ui/icon-button";
import { InfoPill } from "@/components/ui/info-pill";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { HeartFillIcon, HeartIcon, ShoppingBagIcon } from "@/components/ui/icons";
import type { Menu, MenuCategory } from "@/types";

interface MenuGridProps {
  menus: Menu[];
  categories: MenuCategory[];
  onAddToCart?: (menu: Menu) => void;
}

const currencyFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
});

const resolveHighlightLabel = (menu: Menu): string | null => {
  const sources = [menu.category, menu.description, menu.name];

  for (const source of sources) {
    if (!source || typeof source !== "string") {
      continue;
    }

    const normalized = source.toLowerCase();
    if (
      normalized.includes("new") ||
      normalized.includes("신메뉴") ||
      normalized.includes("new.") ||
      normalized.includes("new!") ||
      normalized.includes("신상")
    ) {
      return "New";
    }
    if (
      normalized.includes("best") ||
      normalized.includes("signature") ||
      normalized.includes("favorite") ||
      normalized.includes("시그니처") ||
      normalized.includes("추천")
    ) {
      return "Best";
    }
  }

  return null;
};

const resolveCategoryLabel = (
  menu: Menu,
  categoryLookup: Map<number, MenuCategory>,
  fallbackLabel: string,
) => {
  if (menu.category_id != null) {
    const category = categoryLookup.get(menu.category_id);
    if (category?.name) {
      return category.name;
    }
  }

  if (typeof menu.category === "string" && menu.category.trim().length > 0) {
    return menu.category;
  }

  return fallbackLabel;
};

export const MenuGrid = ({ menus, categories, onAddToCart }: MenuGridProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState<number[]>([]);

  const orderedCategories = useMemo(
    () => categories.slice().sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    [categories],
  );

  const categoryLookup = useMemo(
    () => new Map<number, MenuCategory>(orderedCategories.map((category) => [category.category_id, category])),
    [orderedCategories],
  );

  const hasUncategorized = useMemo(() => menus.some((menu) => menu.category_id == null), [menus]);

  const segmentedOptions = useMemo(() => {
    const baseOptions = orderedCategories.map((category) => ({
      label: category.name ?? `카테고리 ${category.category_id}`,
      value: String(category.category_id),
    }));

    const options = [{ label: "전체", value: "all" }, ...baseOptions];

    if (hasUncategorized) {
      options.push({ label: "기타", value: "uncategorized" });
    }

    return options;
  }, [orderedCategories, hasUncategorized]);

  const sortedMenus = useMemo(
    () =>
      menus
        .slice()
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .filter((menu) => menu.is_active),
    [menus],
  );

  const filteredMenus = useMemo(() => {
    if (activeCategory === "all") {
      return sortedMenus;
    }

    if (activeCategory === "uncategorized") {
      return sortedMenus.filter((menu) => menu.category_id == null);
    }

    return sortedMenus.filter((menu) => String(menu.category_id ?? "") === activeCategory);
  }, [sortedMenus, activeCategory]);

  const toggleFavorite = (menuId: number) =>
    setFavorites((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]));

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Select Menu</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">원하는 메뉴를 선택해 보세요</h2>
          </div>
        </div>
        <SegmentedControl options={segmentedOptions} value={activeCategory} onValueChange={setActiveCategory} />
      </div>

      <div className="space-y-4">
        {filteredMenus.length ? (
          filteredMenus.map((menu) => {
            const categoryLabel = resolveCategoryLabel(menu, categoryLookup, "시그니처");
            const isFavorite = favorites.includes(menu.menu_id);
            const highlightLabel = resolveHighlightLabel(menu);
            const href = {
              pathname: `/store/${menu.store_id}/menus/${menu.menu_id}`,
              query: { menu: encodeURIComponent(JSON.stringify(menu)) },
            } as const;

            return (
              <Link key={menu.menu_id} href={href} className="group block">
                <article className="flex items-center gap-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface)] px-3 py-3.5 shadow-[var(--shadow-card)] transition-transform duration-150 group-hover:-translate-y-0.5">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[calc(var(--radius-xl)-1rem)] bg-surface-muted">
                    {menu.image_url ? (
                      <img src={menu.image_url} alt={`${menu.name} 이미지`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-200/70 via-brand-100 to-brand-50 text-brand-700">
                        이미지 준비 중
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-center gap-2 text-left">
                    <div className="space-y-1 text-left">
                      {highlightLabel ? (
                        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-brand-600/80">
                          {highlightLabel}
                        </span>
                      ) : null}
                      <h3 className="text-[1rem] font-semibold leading-snug text-foreground">{menu.name}</h3>
                      {menu.description ? (
                        <p className="text-[0.85rem] text-muted-foreground line-clamp-2">{menu.description}</p>
                      ) : (
                        <p className="text-[0.85rem] text-muted-foreground/75">주문량이 많은 인기 메뉴예요.</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 justify-between">
                      <span className="text-[1.05rem] font-semibold text-brand-700">
                        {currencyFormatter.format(menu.price)}
                      </span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onAddToCart?.(menu);
                        }}
                        aria-label="장바구니에 추가"
                        className={iconButtonClassName({
                          variant: "primary",
                          size: "xs",
                          className: "shadow-none",
                        })}
                      >
                        <ShoppingBagIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })
        ) : (
          <div className="rounded-[var(--radius-xl)] border border-dashed border-border-soft bg-surface-muted/40 px-8 py-12 text-center text-sm text-muted-foreground">
            현재 선택한 카테고리에 등록된 메뉴가 없습니다. 다른 카테고리를 선택해 보세요.
          </div>
        )}
      </div>
    </section>
  );
};
