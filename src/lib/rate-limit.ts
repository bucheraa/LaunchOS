/**
 * Sliding-window rate limiter backed by Redis (ioredis).
 * Falls back to an in-process store when Redis is unavailable
 * (e.g., during local development without Redis).
 *
 * Usage:
 *   const result = await rateLimit(identifier, { max: 10, window: 60 });
 *   if (!result.success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
 */

import Redis from "ioredis";

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp (seconds) when the window resets
}

// Module-level Redis client (reused across invocations in the same process)
let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!redisClient) {
    try {
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
        lazyConnect: true,
      });
      redisClient.on("error", () => {
        // Silently degrade — don't crash the app if Redis is unavailable
        redisClient = null;
      });
    } catch {
      redisClient = null;
    }
  }
  return redisClient;
}

// In-process fallback store: key → { count, resetAt }
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  identifier: string,
  options: { max: number; window: number } = { max: 20, window: 60 }
): Promise<RateLimitResult> {
  const { max, window: windowSeconds } = options;
  const key = `rl:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const resetAt = now + windowSeconds;

  const redis = getRedis();

  if (redis) {
    try {
      const [[, current], [, ttl]] = (await redis
        .pipeline()
        .incr(key)
        .ttl(key)
        .exec()) as [[null, number], [null, number]];

      // Set TTL on first request
      if (current === 1 || ttl < 0) {
        await redis.expire(key, windowSeconds);
      }

      const remaining = Math.max(0, max - current);
      const actualReset = ttl > 0 ? now + ttl : resetAt;
      return { success: current <= max, limit: max, remaining, reset: actualReset };
    } catch {
      // Fall through to in-memory on Redis error
    }
  }

  // In-memory fallback
  const entry = inMemoryStore.get(key);
  if (!entry || entry.resetAt <= now) {
    inMemoryStore.set(key, { count: 1, resetAt });
    return { success: true, limit: max, remaining: max - 1, reset: resetAt };
  }

  entry.count += 1;
  const remaining = Math.max(0, max - entry.count);
  return {
    success: entry.count <= max,
    limit: max,
    remaining,
    reset: entry.resetAt,
  };
}
