import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

const limiters = new Map<string, Ratelimit>();

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  // Failsafe if Upstash is not configured
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    console.warn("Upstash Redis not configured, skipping rate limit.");
    return true;
  }

  const windowSec = Math.floor(windowMs / 1000) + " s";
  const limiterKey = `${limit}-${windowSec}`;

  let limiter = limiters.get(limiterKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, windowSec as any),
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
