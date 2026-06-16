# AI Prompt Pack (Day 3 Prep)

This directory is the source of truth for Day 3 AI behavior and routing policy.

## Files
- `system-prompts.md`: global policy/system prompts.
- `task-prompts.md`: action-specific templates and runtime variables.
- `model-routing-and-costs.md`: dynamic model selection, caps, fallback, and budget policy.
- `upstash-rate-limits-and-usage.md`: entitlement tier derivation, Upstash limiter shape, and usage logging flow.

## Runtime mapping (current code locations)
- `app/api/ai/write/route.ts` -> `task.write.v1`
- `app/api/ai/rewrite/route.ts` -> `task.rewrite.v1`
- `app/api/ai/summarize/route.ts` -> `task.summarize.v1`
- `app/api/ai/expand/route.ts` -> `task.expand.v1`
- `app/api/ai/brainstorm/route.ts` -> `task.brainstorm.v1`
- `app/api/ai/autocomplete/route.ts` -> `task.autocomplete.v1`

## Reconciliations captured
- Treat `trial` / `pro` as a derived **tier** from `subscriptions.status` (not a stored plan column).
- Keep Upstash for real-time control, and Postgres `ai_usage` for durable truth.
- Use concrete `maxOutputTokens` caps per action (AI SDK v5 naming).
- Log `prompt_version` in usage events once schema columns are added.

## Schema note
To fully support Day 3 instrumentation, extend `ai_usage` with:
- `prompt_version`
- `tier`
- `latency_ms`
- `request_id`
- `fallback_reason`
