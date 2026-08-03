import { headers } from "next/headers";

/*
  `fetch` on the server has no implicit origin, so a relative path like
  `/api/blogs` throws ("Failed to parse URL from /api/blogs"). Prefer an
  explicit env var in production; fall back to the incoming request's own
  host/protocol (works in dev and most deployments without extra config).
*/
export async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error(
      "Could not resolve a base URL for the API request — set NEXT_PUBLIC_SITE_URL.",
    );
  }

  return `${protocol}://${host}`;
}