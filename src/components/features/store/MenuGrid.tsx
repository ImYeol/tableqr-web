"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightIcon, HeartFillIcon, HeartIcon } from "@/components/ui/icons";
import type { Menu } from "@/types";

interface MenuGridProps {
  menus: Menu[];
}

const currencyFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
});

const normalizeCategory = (raw?: string | number | null) => {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed.length ? trimmed : "추천 메뉴";
  }
  if (typeof raw === "number") {
    return `카테고리 ${raw}`;
  }
  return "추천 메뉴";
};

export const MenuGrid = ({ menus }: MenuGridProps) => {
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
    <section className="space-y-8">

      <nav className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto border-b border-border-soft/60 pb-4">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`relative whitespace-nowrap px-1 pb-1 text-sm font-semibold transition-colors ${
                isActive ? "text-brand-600" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {category}
              {isActive ? (
                <span className="absolute inset-x-0 -bottom-[0.55rem] mx-auto h-2 w-8 rounded-full bg-brand-500/85" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {filteredMenus.length ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {filteredMenus.map((menu) => {
            const category = normalizeCategory(menu.category);
            const isFavorite = favorites.includes(menu.menu_id);
            return (
              <Card key={menu.menu_id} className="group flex flex-col overflow-hidden border border-border-soft/50 bg-surface/95">
                <div className="relative h-44 w-full overflow-hidden bg-surface-muted/80">
                  {menu.image_url ? (
                    <img
                      alt={`${menu.name} 이미지`}
                      src={menu.image_url}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 via-brand-50 to-white text-brand-600">
                      이미지 준비 중
                    </div>
                  )}
                  <span className="absolute left-5 top-4 inline-flex items-center rounded-full bg-black/55 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    {category}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(menu.menu_id)}
                    aria-label="즐겨찾기 토글"
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-500 shadow-sm transition-transform hover:scale-105"
                  >
                    {isFavorite ? <HeartFillIcon className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
                  </button>
                </div>
                <CardHeader className="space-y-1 px-6 pb-0 pt-5">
                  <CardTitle className="text-lg font-semibold text-foreground">{menu.name}</CardTitle>
                  {menu.description ? (
                    <p className="text-sm text-muted-foreground/85">{menu.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground/70">주문량이 많은 인기 메뉴예요.</p>
                  )}
                </CardHeader>
                <CardContent className="mt-auto flex items-center justify-between px-6 pb-6 pt-4">
                  <div className="flex flex-col text-sm text-muted-foreground">
                    <span className="font-semibold text-brand-600">{currencyFormatter.format(menu.price)}</span>
                    <span className="text-xs text-muted-foreground/70">지금 바로 주문해 보세요</span>
                  </div>
                  <Link
                    href={`/store/${menu.store_id}/menus/${menu.menu_id}`}
                    className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-pill)] px-4 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
                  >
                    상세보기
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-border-soft/70 bg-surface-muted/40 p-10 text-center text-muted-foreground">
          현재 선택한 카테고리에 등록된 메뉴가 없습니다. 다른 카테고리를 선택해 보세요.
        </div>
      )}
    </section>
  );
};
