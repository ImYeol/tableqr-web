'use client';

import { useEffect, useMemo, useState } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { CloseIcon } from "@/components/ui/icons";

import { MenuImageCarousel } from "./MenuImageCarousel";

interface MenuImageGalleryProps {
  images: Array<{ src: string; alt: string }>;
  thumbnailSize?: "default" | "expanded" | "full" | "fluid";
  thumbnailVariant?: "elevated" | "flat";
  rounded?: boolean;
  className?: string;
}

export const MenuImageGallery = ({
  images,
  thumbnailSize = "fluid",
  thumbnailVariant = "flat",
  rounded = true,
  className,
}: MenuImageGalleryProps) => {
  const safeImages = useMemo(() => images.filter((image) => Boolean(image.src)), [images]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [isLightboxOpen]);

  const handleOpen = (index: number) => {
    setActiveIndex(index);
    setIsLightboxOpen(true);
  };

  const handleClose = () => {
    setIsLightboxOpen(false);
  };

  if (!safeImages.length) {
    return (
      <MenuImageCarousel
        images={safeImages}
        size={thumbnailSize}
        variant={thumbnailVariant}
        rounded={rounded}
        className={className}
      />
    );
  }

  return (
    <>
      <MenuImageCarousel
        images={safeImages}
        size={thumbnailSize}
        variant={thumbnailVariant}
        rounded={rounded}
        className={className}
        onExpand={handleOpen}
        onSlideChange={setActiveIndex}
      />
      {isLightboxOpen ? (
        <div
          className="fixed inset-0 z-[120] flex flex-col bg-black/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={handleClose}
        >
          <div className="flex items-center justify-end px-4 pt-[calc(var(--safe-top,0px)+0.8rem)]">
            <IconButton
              aria-label="이미지 닫기"
              variant="ghost"
              size="sm"
              className="bg-white/10 text-white hover:bg-white/20"
              onClick={(event) => {
                event.stopPropagation();
                handleClose();
              }}
            >
              <CloseIcon className="h-5 w-5" />
            </IconButton>
          </div>
          <div className="relative flex flex-1 items-center justify-center" onClick={(event) => event.stopPropagation()}>
            <MenuImageCarousel
              images={safeImages}
              size="full"
              variant="flat"
              rounded={false}
              imageFit="contain"
              initialIndex={activeIndex}
              onSlideChange={setActiveIndex}
            />
            <div className="pointer-events-none absolute bottom-[calc(var(--safe-bottom,0px)+1rem)] left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white/90">
              <span>
                {activeIndex + 1} / {safeImages.length}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
