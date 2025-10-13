import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { ClockIcon, HeartIcon } from "@/components/ui/icons";
import type { Store } from "@/types";

interface StoreHeroProps {
  store: Store;
  menuCount: number;
  queueHref: string;
}

export const StoreHero = ({ store, menuCount, queueHref }: StoreHeroProps) => (
  <section className="relative isolate flex w-full flex-col overflow-hidden">
    <div className="absolute inset-0">
      {store.cover_url ? (
        <img
          alt={`${store.name} 대표 이미지`}
          className="h-full w-full scale-105 object-cover blur-[2px]"
          src={store.cover_url}
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 blur-[2px]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/20" />
    </div>

    <div className="relative mx-auto flex w-full max-w-5xl flex-col px-6 pt-32 pb-28 text-white sm:px-8 lg:px-10">
      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
        TableQR Store
      </span>
      <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-white drop-shadow-sm md:text-5xl">
        {store.name}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
        {store.description ?? "방문해 주셔서 감사합니다. 정성 가득한 메뉴로 즐거운 시간을 선사할게요."}
      </p>
      <div className="mt-6 flex flex-wrap gap-6 text-sm text-white/80">
        {store.address ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">📍</span>
            <span>{store.address}</span>
          </div>
        ) : null}
        {store.phone ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">☎️</span>
            <span>{store.phone}</span>
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">🧾</span>
          <span>{menuCount}개의 메뉴가 준비되어 있어요</span>
        </div>
      </div>
    </div>

    <div className="relative z-[2] mx-auto w-full max-w-4xl translate-y-[55%] px-6 pb-6 sm:px-8 lg:px-0">
      <div className="flex flex-col gap-5 rounded-[44px] bg-white/95 px-6 py-5 shadow-[0_24px_60px_-32px_rgba(31,27,22,0.42)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <ClockIcon className="h-7 w-7" />
          </span>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">평균 준비 시간</p>
            <p className="text-xs text-muted-foreground">
              30~40분 예상 · 총 {menuCount}개 메뉴가 준비되어 있어요
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={queueHref}
            className={buttonClassName({ variant: "primary", size: "sm", className: "px-5" })}
          >
            대기 현황 보기
          </Link>
          <button
            type="button"
            aria-label="즐겨찾기 추가"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border-soft/70 bg-white text-brand-500 shadow-[0_18px_32px_-26px_rgba(31,27,22,0.3)] transition-transform hover:scale-105"
          >
            <HeartIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
    <div className="h-24" aria-hidden="true" />
  </section>
);
