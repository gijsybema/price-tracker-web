import { headers } from "next/headers";

// Client IP from forwarding headers, for per-IP rate limiting (T12).
// Shared by the Server Action (app/actions/semantic-search.ts) and the
// search-summary Route Handler (app/api/search-summary/route.ts).
export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return h.get("x-real-ip");
}
