import Link from "next/link";

import { IconButton, iconButtonClassName } from "@/components/ui/icon-button";
import { ArrowLeftIcon, HeartIcon, ShareIcon } from "@/components/ui/icons";
import type { Store } from "@/types";

interface MobileStoreHeaderProps {
  store: Store;
  backHref?: string;
  operatingHours?: string;
  notice?: string | null;
}

export const MobileStoreHeader = ({
  store,
  backHref = "/",
  operatingHours = "10:00 - 22:00",
  notice,
}: MobileStoreHeaderProps) => {
  const phoneNumber = store.phone ?? "문의 전화번호 준비 중";

  return (
    <section className="space-y-6">
      <div className="-mx-5">
        <div className="relative aspect-[3/2] w-full overflow-hidden">
          {store.cover_url ? (
            <img
              src={store.cover_url}
              alt={`${store.name} 대표 이미지`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-200/70 via-brand-100 to-brand-50 text-brand-700">
              매장 이미지 준비 중
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />

          <div className="absolute inset-x-0 top-0 flex items-center justify-end px-4 pt-[calc(var(--safe-top,0px)+0.6rem)]">
            <div className="flex items-center gap-2">
              <IconButton aria-label="공유하기" variant="ghost" size="sm" className="bg-black/35 text-white">
                <ShareIcon className="h-5 w-5" />
              </IconButton>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-start px-5 pb-5">
            {store.logo_url ? (
              <div className="h-16 w-16 rounded-full overflow-hidden border border-white/80 shadow-[0_18px_32px_-22px_rgba(0,0,0,0.55)]">
                <img
                  src={store.logo_url}
                  alt={`${store.name} 로고`}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/25 text-lg font-semibold text-white">
                {store.name.slice(0, 2)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <header className="space-y-3">
          <div className="space-y-2 text-left">
            <h1 className="font-display text-[1.85rem] font-semibold leading-tight text-foreground">{store.name}</h1>
            {store.description ? <p className="text-sm text-muted-foreground">{store.description}</p> : null}
          </div>
          {store.address ? <p className="text-sm font-medium text-muted-foreground">{store.address}</p> : null}
        </header>

        <dl className="space-y-3">
          <div className="flex items-center justify-between border-b border-border-soft pb-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">운영시간</dt>
            <dd className="text-sm font-semibold text-foreground">{operatingHours}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-border-soft pb-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">문의 전화</dt>
            <dd className="text-sm font-semibold text-brand-700">{phoneNumber}</dd>
          </div>
          {notice ? (
            <div className="space-y-2 rounded-[var(--radius-lg)] bg-brand-600/10 px-4 py-3 text-sm text-brand-700">
              <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700/70">Notice</dt>
              <dd className="text-sm leading-relaxed text-brand-700/90">{notice}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  );
};
