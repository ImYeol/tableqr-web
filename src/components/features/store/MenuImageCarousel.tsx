"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/icon-button";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";

interface MenuImageCarouselProps {
  images: Array<{ src: string; alt: string }>;
  className?: string;
  size?: "default" | "expanded" | "full" | "fluid";
  rounded?: boolean;
  variant?: "elevated" | "flat";
}

const sizeStyles: Record<NonNullable<MenuImageCarouselProps["size"]>, string> = {
  default: "h-[360px] sm:h-[440px] lg:h-[500px]",
  expanded: "h-[440px] sm:h-[560px] lg:h-[660px]",
  full: "min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh]",
  fluid: "h-full",
};

const containerVariantStyles: Record<NonNullable<MenuImageCarouselProps["variant"]>, string> = {
  elevated: "bg-surface shadow-[0_36px_70px_-46px_rgba(31,27,22,0.5)]",
  flat: "bg-transparent shadow-none",
};

export const MenuImageCarousel = ({
  images,
  className,
  size = "default",
  rounded = true,
  variant = "elevated",
}: MenuImageCarouselProps) => {
  const safeImages = useMemo(() => (images.length ? images : []), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const heightClass = sizeStyles[size];
  const containerVariantClass = containerVariantStyles[variant];

  if (!safeImages.length) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center text-sm font-semibold text-brand-500",
          variant === "elevated"
            ? "rounded-[calc(var(--radius-lg)+0.6rem)] bg-gradient-to-br from-brand-100 via-white to-brand-50 shadow-[0_36px_70px_-46px_rgba(31,27,22,0.5)]"
            : "bg-brand-50/60",
          rounded && "rounded-[calc(var(--radius-lg)+0.6rem)]",
          heightClass,
          className,
        )}
      >
        메뉴 이미지가 준비 중입니다.
      </div>
    );
  }

  const prev = () => setActiveIndex((prevIndex) => (prevIndex - 1 + safeImages.length) % safeImages.length);
  const next = () => setActiveIndex((prevIndex) => (prevIndex + 1) % safeImages.length);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        containerVariantClass,
        rounded && "rounded-[calc(var(--radius-lg)+0.6rem)]",
        heightClass,
        className,
      )}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {safeImages.map(({ src, alt }, index) => (
          <div key={src + index} className="relative h-full w-full shrink-0 overflow-hidden bg-black/5">
            <img alt={alt} src={src} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-black/5 to-transparent" />
          </div>
        ))}
      </div>

      {safeImages.length > 1 ? (
        <>
          <IconButton
            type="button"
            onClick={prev}
            aria-label="이전 이미지"
            size="sm"
            variant="ghost"
            className="absolute left-5 top-1/2 -translate-y-1/2 border border-white/70 bg-white/95 text-muted-foreground shadow-[0_16px_32px_-24px_rgba(31,27,22,0.32)] hover:scale-105"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </IconButton>
          <IconButton
            type="button"
            onClick={next}
            aria-label="다음 이미지"
            size="sm"
            variant="ghost"
            className="absolute right-5 top-1/2 -translate-y-1/2 border border-white/70 bg-white/95 text-muted-foreground shadow-[0_16px_32px_-24px_rgba(31,27,22,0.32)] hover:scale-105"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </IconButton>
        </>
      ) : null}

      {safeImages.length > 1 ? (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-4 py-2 backdrop-blur-sm">
          {safeImages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`${index + 1}번째 이미지 보기`}
              className={cn(
                "h-2.5 w-2.5 transition-colors",
                index === activeIndex ? "bg-white" : "bg-white/40",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
