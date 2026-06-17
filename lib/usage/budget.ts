import { Redis } from '@upstash/redis'
import type { Tier } from '@/lib/usage/tier'

type BudgetResult = {
  ok: boolean
  nearBudget: boolean
  reason?: string
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
const redis =
  redisUrl && redisToken
    ? new Redis({ url: redisUrl, token: redisToken })
    : null

const DAILY_LIMITS: Record<Tier, number> = {
  trial: 30000,
  pro: 300000,
}

const MONTHLY_LIMITS: Record<Tier, number> = {
  trial: 300000,
  pro: 3000000,
}

function dayKey(userId: string, tier: Tier) {
  const date = new Date().toISOString().slice(0, 10)
  return `budget:${tier}:day:${date}:${userId}`
}

function monthKey(userId: string, tier: Tier) {
  const month = new Date().toISOString().slice(0, 7)
  return `budget:${tier}:month:${month}:${userId}`
}

export async function assertBudget(options: {
  userId: string
  tier: Tier
  projectedTokens: number
}): Promise<BudgetResult> {
  if (!redis) return { ok: true, nearBudget: false }

  const dailyKey = dayKey(options.userId, options.tier)
  const monthlyKey = monthKey(options.userId, options.tier)

  const [dailyUsageRaw, monthlyUsageRaw] = await Promise.all([
    redis.get<number>(dailyKey),
    redis.get<number>(monthlyKey),
  ])

  const dailyUsage = Number(dailyUsageRaw ?? 0)
  const monthlyUsage = Number(monthlyUsageRaw ?? 0)

  const dailyLimit = DAILY_LIMITS[options.tier]
  const monthlyLimit = MONTHLY_LIMITS[options.tier]

  if (dailyUsage + options.projectedTokens > dailyLimit) {
    return { ok: false, nearBudget: true, reason: 'Daily AI token budget reached.' }
  }

  if (monthlyUsage + options.projectedTokens > monthlyLimit) {
    return { ok: false, nearBudget: true, reason: 'Monthly AI token budget reached.' }
  }

  const nearDaily = dailyUsage >= dailyLimit * 0.8
  const nearMonthly = monthlyUsage >= monthlyLimit * 0.8
  return { ok: true, nearBudget: nearDaily || nearMonthly }
}

export async function recordBudgetUsage(options: {
  userId: string
  tier: Tier
  tokensUsed: number
}) {
  if (!redis) return

  const dailyKey = dayKey(options.userId, options.tier)
  const monthlyKey = monthKey(options.userId, options.tier)

  const dailyTtl = 60 * 60 * 24 * 2
  const monthlyTtl = 60 * 60 * 24 * 40

  await Promise.all([
    redis.incrby(dailyKey, options.tokensUsed),
    redis.incrby(monthlyKey, options.tokensUsed),
    redis.expire(dailyKey, dailyTtl),
    redis.expire(monthlyKey, monthlyTtl),
  ])
}
