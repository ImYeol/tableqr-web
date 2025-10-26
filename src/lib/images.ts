import type { Menu } from "@/types";

export const DEFAULT_BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAHElEQVR42mNgGAWjgBD9T0pK+j8TI3EwCkb9jxEAYlgGC4Y8RDECAP5DDfs/qnSzAAAAAElFTkSuQmCC";

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

export const resolveMenuImageSrc = (menu: Pick<Menu, "image_url" | "updated_at">) =>
  buildVersionedImageUrl(menu.image_url, menu.updated_at);
