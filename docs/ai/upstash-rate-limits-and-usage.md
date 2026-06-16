# Upstash, Rate Limiting, and Usage Logging

> Updated 2026-06-16 — reconciled with the build: tier (`trial`/`pro`) derived from subscription status; `lib/usage/` module shape; trial policy aligned with the 7-day trial.

Short answer: yes, use Upstash for rate limiting. But for product analytics and billing-grade history, keep Postgres `ai_usage` as the durable source of truth. Use both.

## Recommended split
- Upstash Redis + `@upstash/ratelimit`
  - Real-time protection (requests/minute, burst limits)
  - Fast quota checks before model calls
  - Abuse prevention and cost guardrails
- Postgres `ai_usage` table
  - Durable event log (tokens, action, model, prompt_version, tier, timestamp)
  - Auditing, analytics, billing reconciliation

## Tier model (shared with the router)
Access is governed by a **derived tier**, not a stored "plan" column:

| `subscriptions.status` | tier | access |
| --- | --- | --- |
| `active` | `pro` | full; premium model gated to quality mode |
| `trialing` (not expired) | `trial` | fast/standard; trial limits below |
| `trialing` (expired) / `past_due` / `canceled` | — | blocked → upsell |

```ts
// lib/usage/tier.ts
export type Tier = 'trial' | 'pro'
export function deriveTier(sub: { status: string; trialEndsAt: Date | null } | null): Tier | null {
  if (!sub) return null
  if (sub.status === 'active') return 'pro'
  if (sub.status === 'trialing' && sub.trialEndsAt && sub.trialEndsAt > new Date()) return 'trial'
  return null
}
```

## `lib/usage/` module shape
```
lib/usage/
  tier.ts        deriveTier()
  ratelimit.ts   Upstash sliding windows, keyed by tier + user + action + window
  budget.ts      daily/monthly token budget per tier (counters in Upstash, truth in ai_usage)
  gate.ts        assertCanGenerate({ userId, action, inputChars }) -> { ok, tier, reason? }
```

## Request flow (target)
1. Authenticate user
2. Resolve subscription → `deriveTier` (block if `null`)
3. Upstash rate-limit check (per tier + action)
4. Budget check (daily/monthly token budget)
5. Select model via router (`selectModel`)
6. Execute generation (`streamText`)
7. Persist usage event to Postgres `ai_usage` in `onFinish` (tokens, action, model, prompt_version, tier, latency)
8. Increment lightweight counters in Upstash (optional)

Steps 2–4 are the single `gate.assertCanGenerate(...)` call every AI route makes before generating.

## Key design points
- Never rely on Upstash alone for billing/reporting.
- Never rely on Postgres alone for burst protection.
- Upstash keys include user + action + window for fine-grained control (e.g. `rl:trial:write:h:{userId}`).

## Suggested limits (starting values)
The trial is a **7-day window** (enforced by `trialEndsAt`); the rate limits below run *inside* that window to stop burst/abuse. A trial ends at 7 days regardless of remaining rate budget.

Trial:
- 20 AI requests per hour
- 100 AI requests per day
- strict daily token budget

Pro:
- higher request windows (e.g. 120/hour)
- larger daily/monthly token budget

> These supersede the looser "~50 generations" figure used earlier in planning. Confirm final numbers with product.

## Failure behavior (product decision — confirm)
- If Upstash is down:
  - **fail closed** for `trial` (abuse-sensitive), or
  - **temporary fail-open** for `pro` with conservative token caps.

## Environment variables (expected)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `OPENROUTER_API_KEY`
- existing DB vars for usage persistence

## Day 3 implementation checklist
- Add `lib/usage/tier.ts`, `ratelimit.ts`, `budget.ts`, `gate.ts`
- Call `gate.assertCanGenerate(...)` in every AI route before generation
- Persist the usage row in `ai_usage` on completion (`onFinish`), including `prompt_version` and `tier`
  - requires the `ai_usage` column additions (see the review doc / `phase-1-schema.sql`)
