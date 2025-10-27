// Centralized cache configuration for dev/prod behavior
// - Dev: disable caching to avoid .next lookup issues during HMR
// - Prod: enable 10 min caching across SSR/ISR, API routes, fetch and SWR

export const IS_PROD = process.env.NODE_ENV === "production";
export const IS_DEV = !IS_PROD;

// SSR/ISR
export const REVALIDATE_SECONDS = IS_DEV ? 0 : 600; // 10 minutes in prod
export const DYNAMIC_MODE: "force-static" | "force-dynamic" = IS_DEV ? "force-dynamic" : "force-static";

// fetch() defaults
export const FETCH_CACHE_MODE: RequestCache | undefined = IS_DEV ? "no-store" : "force-cache";

// SWR
export const SWR_DEDUPE_MS = IS_DEV ? 0 : 5 * 60 * 1000; // 5 minutes in prod

// API Route cache headers
export const EDGE_CACHE_SECONDS = IS_DEV ? 0 : 600; // CDN/Edge cache
export const BROWSER_CACHE_SECONDS = IS_DEV ? 0 : 600; // Browser cache

export function getApiCacheHeaders(): Record<string, string> {
  if (IS_DEV) {
    return { "Cache-Control": "no-store" };
  }

  // Enable CDN + browser cache in prod
  return {
    "Cache-Control": `public, max-age=${BROWSER_CACHE_SECONDS}, s-maxage=${EDGE_CACHE_SECONDS}, stale-while-revalidate=60`,
  };
}

// Helper to merge headers for API responses
export function withApiCacheHeaders(init?: ResponseInit): ResponseInit {
  const cacheHeaders = getApiCacheHeaders();
  const prev = init?.headers instanceof Headers ? Object.fromEntries(init.headers.entries()) : (init?.headers as any);
  return {
    ...init,
    headers: {
      ...(prev ?? {}),
      ...cacheHeaders,
    },
  };
}

