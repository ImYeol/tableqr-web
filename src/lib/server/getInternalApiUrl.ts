import { headers } from "next/headers";

export const getInternalApiUrl = async (path: string) => {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");

  if (!host) {
    throw new Error("Unable to determine request host");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${protocol}://${host}${normalizedPath}`;
};
