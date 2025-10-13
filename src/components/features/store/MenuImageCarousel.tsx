"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

interface MenuImageCarouselProps {
  images: Array<{ src: string; alt: string }>;
}

export const MenuImageCarousel = ({ images }: MenuImageCarouselProps) => {
  const safeImages = useMemo(() => (images.length ? images : []), [images]);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!safeImages.length) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-[var(--radius-lg)] bg-gradient-to-br from-brand-100 via-white to-brand-50 text-sm font-semibold text-brand-500">
        메뉴 이미지가 준비 중입니다.
      </div>
    );
  }

  const prev = () => setActiveIndex((prevIndex) => (prevIndex - 1 + safeImages.length) % safeImages.length);
  const next = () => setActiveIndex((prevIndex) => (prevIndex + 1) % safeImages.length);

  return (
    <div className="relative overflow-hidden rounded-[calc(var(--radius-lg)+0.5rem)] bg-surface shadow-[0_30px_60px_-40px_rgba(31,27,22,0.45)]">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {safeImages.map(({ src, alt }, index) => (
          <div key={src + index} className="relative h-[340px] w-full shrink-0 overflow-hidden bg-black/5">
            <img alt={alt} src={src} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-black/5 to-transparent" />
          </div>
        ))}
      </div>

      {safeImages.length > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="이전 이미지"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg text-muted-foreground shadow-md transition-transform hover:scale-105"
          >
            &lt;
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="다음 이미지"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg text-muted-foreground shadow-md transition-transform hover:scale-105"
          >
            &gt;
          </button>
        </>
      ) : null}

      {safeImages.length > 1 ? (
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-4 py-2">
          {safeImages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`${index + 1}번째 이미지 보기`}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors",
                index === activeIndex ? "bg-white" : "bg-white/40",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
