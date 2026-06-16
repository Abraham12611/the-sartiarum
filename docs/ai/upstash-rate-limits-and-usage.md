# Upstash, Rate Limiting, and Usage Logging

Short answer: yes, we should use Upstash for rate limiting. But for product analytics and billing-grade history, keep using Postgres `ai_usage` as the durable source of truth. We should use both.

## Recommended split
- Upstash Redis + `@upstash/ratelimit`
  - Real-time protection (requests/minute, burst limits)
  - Fast quota checks before model calls
  - Good for abuse prevention and cost guardrails
- Postgres `ai_usage` table
  - Durable event log (tokens, action, model, timestamp)
  - Auditing, analytics, billing reconciliation

## Request flow (target)
1. Authenticate user
2. Check entitlement (`trial`/`active`)
3. Upstash rate-limit check
4. Budget check (daily/monthly token budget)
5. Select model via router
6. Execute generation
7. Persist usage event to Postgres (`ai_usage`)
8. Increment lightweight counters in Upstash (optional)

## Key design points
- Never rely on Upstash alone for billing/reporting.
- Never rely on Postgres alone for burst protection.
- Upstash keys should include user + action + window for fine-grained controls.

## Suggested limits (starting values)
Trial:
- 20 AI requests per hour
- 100 AI requests per day
- strict token budget per day

Pro:
- higher request windows
- larger token budget

## Failure behavior
- If Upstash is down:
  - fail closed for trial abuse-sensitive endpoints, or
  - temporary fail-open for paid users with conservative token caps (business decision).

## Environment variables (expected)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `OPENROUTER_API_KEY`
- existing DB vars for usage persistence

## Day 3 implementation checklist
- Add centralized limiter in `lib/usage/`
- Add centralized budget checker in `lib/usage/`
- Call both in every AI route before generation
- Keep final usage insert in `ai_usage` on completion
