import { LRUCache } from "lru-cache";

/**
 * Simple in-memory sliding-window rate limiter, keyed by identifier
 * (typically client IP). Sufficient for a single-instance MVP deployment.
 *
 * PRODUCTION NOTE: In a multi-instance/serverless deployment (e.g. Vercel
 * with multiple concurrent function instances), in-memory state is NOT
 * shared across instances, so this provides best-effort protection only.
 * For production, swap this for a shared store like Upstash Redis
 * (see README "Scalability" section for reasoning).
 */

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
};

const cache = new LRUCache<string, number[]>({
  max: 5000, // max distinct identifiers tracked at once
});

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  const timestamps = (cache.get(identifier) ?? []).filter(
    (t) => t > windowStart
  );

  if (timestamps.length >= options.maxRequests) {
    cache.set(identifier, timestamps);
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  cache.set(identifier, timestamps);

  return {
    allowed: true,
    remaining: options.maxRequests - timestamps.length,
  };
}

export function getClientIp(request: Request): string {
  // Vercel/most proxies set this header. Fall back to a constant
  // if unavailable (e.g. local dev without a proxy in front).
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown-client";
}