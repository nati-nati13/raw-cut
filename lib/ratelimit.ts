import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

function makeRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[ratelimit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — rate limiting DISABLED in production')
    }
    return null
  }
  return Redis.fromEnv()
}

const redis = makeRedis()

// Auth routes: 5 req / IP / minute
const authLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '1 m'), prefix: 'rl:auth' })
  : null

// Payment intent: 10 req / user / minute
const paymentLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 m'), prefix: 'rl:payment' })
  : null

function rateLimitHeaders(limit: number, remaining: number, reset: number) {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(reset),
    'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
  }
}

/** Returns 429 NextResponse if rate limited, null if allowed. */
export async function checkAuthRateLimit(req: NextRequest): Promise<NextResponse | null> {
  if (!authLimiter) return null
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  const { success, limit, remaining, reset } = await authLimiter.limit(ip)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429, headers: rateLimitHeaders(limit, remaining, reset) }
    )
  }
  return null
}

/** Returns 429 NextResponse if rate limited, null if allowed. */
export async function checkPaymentRateLimit(userId: string): Promise<NextResponse | null> {
  if (!paymentLimiter) return null
  const { success, limit, remaining, reset } = await paymentLimiter.limit(userId)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many payment requests. Try again later.' },
      { status: 429, headers: rateLimitHeaders(limit, remaining, reset) }
    )
  }
  return null
}
