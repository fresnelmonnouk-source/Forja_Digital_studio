import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
const limiters = new Map<string, Ratelimit>();

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Failsafe if Upstash is not properly configured
  if (!url || !token || url.includes("...")) {
    console.warn("Upstash Redis not configured properly, skipping rate limit.");
    return true;
  }

  if (!redis) {
    redis = new Redis({ url, token });
  }

  const windowSec = Math.floor(windowMs / 1000);
  const limiterKey = `${limit}-${windowSec}s`;

  let limiter = limiters.get(limiterKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis as Redis,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s` as any),
      analytics: false,
    });
    limiters.set(limiterKey, limiter);
  }

  try {
    const { success } = await limiter.limit(key);
    return success;
  } catch (error) {
    console.error("Rate limit error:", error);
    return true; // Failsafe
  }
}

export function getIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}
