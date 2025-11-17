import Link from "next/link";

import { IconButton, iconButtonClassName } from "@/components/ui/icon-button";
import { ArrowLeftIcon, HeartIcon, ShareIcon } from "@/components/ui/icons";
import { buildImageVariantUrl } from "@/lib/images";
import type { Store } from "@/types";

interface MobileStoreHeaderProps {
  store: Store;
  operatingHours?: string;
  notice?: string | null;
}

export const MobileStoreHeader = ({
  store,
  operatingHours = "",
  notice = "",
}: MobileStoreHeaderProps) => {
  const phoneNumber = store.phone ?? "";
  const coverImageUrl = buildImageVariantUrl(store.cover_url, "large") ?? store.cover_url;
  const logoImageUrl = buildImageVariantUrl(store.logo_url, "thumb") ?? store.logo_url;

  return (
    <section className="space-y-6">
      <div className="-mx-5">
        <div className="relative aspect-[3/2] w-full overflow-hidden">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={`${store.name} 대표 이미지`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-200/70 via-brand-100 to-brand-50 text-brand-700">
              Image is preparing
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex justify-start px-5 pb-5">
            {logoImageUrl ? (
              <div className="h-16 w-16 rounded-full overflow-hidden border border-white/80 shadow-[0_18px_32px_-22px_rgba(0,0,0,0.55)]">
                <img
                  src={logoImageUrl}
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
            <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Operating Hours</dt>
            <dd className="text-sm font-semibold text-foreground whitespace-pre-line text-center">{operatingHours}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-border-soft pb-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Phone Number</dt>
            <dd className="text-sm font-semibold text-foreground whitespace-pre-line text-center">{phoneNumber}</dd>
          </div>
          {notice ? (
            <div className="space-y-1.5 border-b border-border-soft pb-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Notice</dt>
              <dd className="text-sm leading-relaxed text-foreground whitespace-pre-line">{notice}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  );
};
