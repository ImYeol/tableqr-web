import type { Menu } from "@/types";

export const DEFAULT_BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAHElEQVR42mNgGAWjgBD9T0pK+j8TI3EwCkb9jxEAYlgGC4Y8RDECAP5DDfs/qnSzAAAAAElFTkSuQmCC";

export type StoreImageVariant = "hero" | "medium" | "thumb" | "large";
export type MenuImageVariant = "hero" | "detail" | "card" | "thumb";
type ImageVariant = StoreImageVariant | MenuImageVariant;

const IMAGE_VARIANT_PATTERN = /(\/)(hero|detail|card|thumb|medium|large)\.webp(?=([?#]|$))/;

export const buildVersionedImageUrl = (url: string | null, version?: string | number | null) => {
  if (!url) {
    return null;
  }

  const versionToken =
    typeof version === "number" ? version.toString() : typeof version === "string" && version.length ? version : null;

  if (!versionToken) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(versionToken)}`;
};

export const buildImageVariantUrl = (url: string | null, variant: ImageVariant) => {
  if (!url) {
    return null;
  }

  if (!IMAGE_VARIANT_PATTERN.test(url)) {
    return url;
  }

  return url.replace(IMAGE_VARIANT_PATTERN, `$1${variant}.webp`);
};

export const resolveMenuImageSrc = (menu: Pick<Menu, "image_url" | "updated_at">, variant: MenuImageVariant = "hero") =>
  buildVersionedImageUrl(buildImageVariantUrl(menu.image_url, variant), menu.updated_at);
