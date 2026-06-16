# Model Routing and Cost Strategy

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
- input size (tokens/chars)
- user plan (`trial`, `pro`, etc.)
- recent usage budget (daily/monthly)
- failure/retry state

Decision examples:
- `autocomplete` -> always `fast`
- `summarize` and small `rewrite` (<1200 chars) -> `fast`
- `write`, `expand`, long `rewrite` -> `standard`
- `premium` only when:
  - user plan allows it, and
  - explicit quality mode is enabled or previous attempts failed.

## 3) Budget policy
Maintain configurable caps:
- per-request token cap (action-specific)
- per-user daily token budget
- per-user monthly token budget
- per-plan model allowlist

When budget is near cap:
- downgrade model tier (`standard` -> `fast`)
- tighten max output tokens
- return graceful warning when cap is exceeded

## 4) Fallback policy
- Primary route call uses selected tier.
- On model provider failure:
  - one retry on same tier (short backoff)
  - then one downgrade retry (if safe for action)
- log each fallback reason for tuning.

## 5) Suggested OpenRouter config
Current code already has:
- `MODELS.fast`
- `MODELS.standard`

Extend to:
- `MODELS.premium`
- `MODELS.fallbackFast`

And add a router function:
- `selectModel({ action, inputSize, plan, budgetState, retryCount }): ModelId`

## 6) Token/output controls by action
Baseline maxima:
- autocomplete: output <= 60 tokens
- summarize: output <= 220 tokens
- rewrite: output <= max(input * 1.25, bounded)
- expand: output <= max(input * 2.0, bounded)
- brainstorm: output <= 280 tokens
- write: output based on selected length profile

## 7) Why this is cost efficient
- expensive tier is opt-in and conditional, not default
- cheap tier handles high-frequency operations (autocomplete)
- budget-aware downgrades stop runaway cost
- action-specific caps limit long-tail token waste

## 8) Implementation phases
- Phase A: introduce router + per-action caps
- Phase B: add budget-aware tier downgrades
- Phase C: add premium gating and quality mode toggle
