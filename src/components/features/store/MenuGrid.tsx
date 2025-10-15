'use client';

import Link from "next/link";
import { useMemo, useState } from "react";

import { iconButtonClassName } from "@/components/ui/icon-button";
import { InfoPill } from "@/components/ui/info-pill";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { HeartFillIcon, HeartIcon, ShoppingBagIcon } from "@/components/ui/icons";
import type { Menu } from "@/types";

interface MenuGridProps {
  menus: Menu[];
  onAddToCart?: (menu: Menu) => void;
}

const currencyFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
});

const normalizeCategory = (raw?: string | number | null) => {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed.length ? trimmed : "시그니처";
  }
  if (typeof raw === "number") {
    return `카테고리 ${raw}`;
  }
  return "시그니처";
};

const resolveHighlightLabel = (menu: Menu): string | null => {
  const sources = [menu.category, menu.description, menu.name];

  for (const source of sources) {
    if (!source || typeof source !== "string") {
      continue;
    }

    const normalized = source.toLowerCase();
    if (normalized.includes("new") || normalized.includes("신메뉴") || normalized.includes("new.") || normalized.includes("new!") || normalized.includes("신상")) {
      return "New";
    }
    if (normalized.includes("best") || normalized.includes("signature") || normalized.includes("favorite") || normalized.includes("시그니처") || normalized.includes("추천")) {
      return "Best";
    }
  }

  return null;
};

export const MenuGrid = ({ menus, onAddToCart }: MenuGridProps) => {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [favorites, setFavorites] = useState<number[]>([]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    menus.forEach((menu) => unique.add(normalizeCategory(menu.category)));
    return ["전체", ...Array.from(unique)];
  }, [menus]);

  const filteredMenus = useMemo(
    () =>
      menus.filter((menu) => {
        const category = normalizeCategory(menu.category);
        return activeCategory === "전체" || category === activeCategory;
      }),
    [menus, activeCategory],
  );

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
        <SegmentedControl
          options={categories.map((category) => ({ label: category, value: category }))}
          value={activeCategory}
          onValueChange={setActiveCategory}
        />
      </div>

      <div className="space-y-4">
        {filteredMenus.length ? (
          filteredMenus.map((menu) => {
            const category = normalizeCategory(menu.category);
            const isFavorite = favorites.includes(menu.menu_id);
            const highlightLabel = resolveHighlightLabel(menu);
            const href = `/store/${menu.store_id}/menus/${menu.menu_id}`;

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
                    <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-2">
                      <InfoPill variant="surface" className="bg-black/55 px-2.5 py-1 text-[0.65rem] text-white/95">
                        {category}
                      </InfoPill>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleFavorite(menu.menu_id);
                      }}
                      aria-label="즐겨찾기 토글"
                      className={iconButtonClassName({
                        variant: "ghost",
                        size: "sm",
                        className: "absolute right-2.5 top-2.5 bg-white text-brand-600 shadow-[0_14px_28px_-20px_rgba(15,49,33,0.3)]",
                      })}
                    >
                      {isFavorite ? <HeartFillIcon className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
                    </button>
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
                    <div className="flex items-center gap-2">
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
