import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import type { AiAction } from '@/lib/ai/router'
import type { Tier } from '@/lib/usage/tier'

type RateLimitResult = { ok: true } | { ok: false; reason: string }

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

const redis =
  redisUrl && redisToken
    ? new Redis({ url: redisUrl, token: redisToken })
    : null

const trialHour = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      prefix: 'rl:trial:hour',
    })
  : null

const trialDay = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 d'),
      prefix: 'rl:trial:day',
    })
  : null

const proHour = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, '1 h'),
      prefix: 'rl:pro:hour',
    })
  : null

const proDay = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1000, '1 d'),
      prefix: 'rl:pro:day',
    })
  : null

export async function assertRateLimit(options: {
  userId: string
  tier: Tier
  action: AiAction
}): Promise<RateLimitResult> {
  if (!redis || !trialHour || !trialDay || !proHour || !proDay) return { ok: true }

  const key = `${options.userId}:${options.action}`
  const [hourLimit, dayLimit] =
    options.tier === 'trial' ? [trialHour, trialDay] : [proHour, proDay]

  const [hour, day] = await Promise.all([hourLimit.limit(key), dayLimit.limit(key)])

  if (!hour.success) return { ok: false, reason: 'Hourly AI request limit reached.' }
  if (!day.success) return { ok: false, reason: 'Daily AI request limit reached.' }

  return { ok: true }
}
