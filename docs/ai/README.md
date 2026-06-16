# AI Prompt Pack (Day 3 Prep)

This directory is the source of truth for the AI behavior we intend to ship in Day 3.

## Files
- `system-prompts.md`: Global behavior and policy prompts.
- `task-prompts.md`: Per-action prompts (write, rewrite, summarize, expand, brainstorm, autocomplete).
- `model-routing-and-costs.md`: Dynamic model routing and cost control strategy.
- `upstash-rate-limits-and-usage.md`: Upstash + DB strategy for rate limiting and usage accounting.

## Runtime mapping (intended)
- `write` -> `task.write`
- `rewrite` -> `task.rewrite`
- `summarize` -> `task.summarize`
- `expand` -> `task.expand`
- `brainstorm` -> `task.brainstorm`
- `autocomplete` -> `task.autocomplete`

## Notes
- Keep prompt text centralized so product tuning does not require touching every route.
- Prompt versions should be added to logs (`prompt_version`) when we implement Day 3 instrumentation.
