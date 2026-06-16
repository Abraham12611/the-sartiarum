# Model Routing and Cost Strategy

> Updated 2026-06-16 — reconciled with the build: `plan` → derived **tier** (`trial`/`pro`); concrete token caps; router signature + AI SDK v5 param names.

Goal: keep quality high while preventing expensive models from being used for every request.

## 1) Routing tiers
Use three model tiers in config, selected dynamically per action and request complexity.

- `fast` (lowest cost, low latency)
  - Use for autocomplete and simple transforms.
  - Example class: small/mini models.
- `standard` (default quality/cost balance)
  - Use for write/rewrite/summarize/expand/brainstorm in normal conditions.
- `premium` (high quality, highest cost)
  - Use only for explicit high-stakes contexts or fallback-on-failure policy.

## 2) Dynamic selection rules (inbuilt)
Inputs used by router:
- action type (`autocomplete`, `rewrite`, etc.)
- input size (chars/tokens)
- **entitlement tier** (`trial`, `pro`) — *derived from `subscriptions.status`, not a stored column* (see `upstash-rate-limits-and-usage.md` and the review doc)
- recent usage budget (daily/monthly)
- quality-mode flag + failure/retry state

Decision examples:
- `autocomplete` -> always `fast`
- `summarize` and small `rewrite` (<1200 chars) -> `fast`
- `write`, `expand`, long `rewrite` -> `standard`
- `premium` only when:
  - tier is `pro`, and
  - explicit quality mode is enabled, or a previous attempt failed (fallback escalation).

## 3) Budget policy
Maintain configurable caps:
- per-request token cap (action-specific, see §6)
- per-tier daily token budget
- per-tier monthly token budget
- per-tier model allowlist (`trial` -> fast/standard; `pro` -> fast/standard/premium)

When budget is near cap:
- downgrade model tier (`standard` -> `fast`)
- tighten `maxOutputTokens`
- return a graceful warning when the cap is exceeded

## 4) Fallback policy
- Primary route call uses the selected tier.
- On model provider failure:
  - one retry on the same tier (short backoff)
  - then one downgrade retry (if safe for the action), using `fallbackFast`
- log each fallback into `ai_usage.fallback_reason` for tuning.

## 5) OpenRouter config + router
Current code has `MODELS.fast` and `MODELS.standard`. Extend:

```ts
// lib/ai/openrouter.ts — model IDs are EXAMPLES; set real OpenRouter slugs at build time
export const MODELS = {
  fast:         'openai/gpt-4o-mini',
  standard:     'anthropic/claude-3.5-sonnet',
  premium:      'anthropic/claude-3.7-sonnet',   // strongest tier (placeholder)
  fallbackFast: 'google/gemini-2.0-flash',       // cross-provider fallback (placeholder)
} as const
```

Router function (note: `tier`, not `plan`):

```ts
type Action = 'write'|'rewrite'|'summarize'|'expand'|'brainstorm'|'autocomplete'

export function selectModel(o: {
  action: Action
  inputChars: number
  tier: 'trial' | 'pro'
  nearBudget: boolean
  retryCount: number
  qualityMode?: boolean
}): keyof typeof MODELS {
  if (o.action === 'autocomplete') return 'fast'
  if (o.action === 'summarize' || (o.action === 'rewrite' && o.inputChars < 1200)) return 'fast'
  if (o.retryCount > 0) return 'fallbackFast'               // downgrade retry
  if (o.nearBudget) return 'fast'                           // budget-aware downgrade
  if (o.tier === 'pro' && o.qualityMode) return 'premium'   // opt-in, gated
  return 'standard'
}
```

## 6) Token/output controls by action
Wire these to `maxOutputTokens` in `streamText` (AI SDK v5 renamed `maxTokens` → `maxOutputTokens`). `inputTokens` below is an estimate from input length.

- autocomplete: `maxOutputTokens = 60`
- summarize: `maxOutputTokens = 220`
- rewrite: `maxOutputTokens = clamp(round(inputTokens * 1.25), 256, 1500)`
- expand: `maxOutputTokens = clamp(round(inputTokens * 2.0), 384, 2000)`
- brainstorm: `maxOutputTokens = 280`
- write (by length profile): `Short ≈ 400`, `Medium ≈ 900`, `Long ≈ 1800`

`clamp(x, lo, hi) = Math.min(Math.max(x, lo), hi)`.

## 7) Why this is cost efficient
- the expensive tier is opt-in and conditional, not default
- the cheap tier handles high-frequency operations (autocomplete)
- budget-aware downgrades stop runaway cost
- action-specific caps limit long-tail token waste

## 8) Implementation phases
- Phase A: introduce router + per-action caps (`maxOutputTokens`)
- Phase B: add budget-aware tier downgrades
- Phase C: add premium gating and quality-mode toggle
