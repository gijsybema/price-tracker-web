import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Per-IP rate limit for searchSemantic (T12). Backed by Redis (Vercel
// Marketplace / Upstash), not the product Postgres DB — that DB is
// scraper/product data only, see the T16 decision in the spec.
const WINDOW = "10 m";
const MAX_REQUESTS = 20;

let ratelimit: Ratelimit | null | undefined;

function getRatelimit(): Ratelimit | null {
  if (ratelimit !== undefined) return ratelimit;

  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    ratelimit = null;
    return ratelimit;
  }

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, WINDOW),
    prefix: "semantic-search",
  });
  return ratelimit;
}

// Returns true if the request is allowed, false if the IP is over the limit.
// Fails open (allows the request) if Redis isn't configured or unreachable,
// so a rate-limit outage degrades to "unlimited" rather than breaking search.
export async function checkRateLimit(ip: string): Promise<boolean> {
  const limiter = getRatelimit();
  if (!limiter) return true;

  try {
    const { success } = await limiter.limit(ip);
    return success;
  } catch (error) {
    console.error("Rate limit check failed, allowing request:", error);
    return true;
  }
}
