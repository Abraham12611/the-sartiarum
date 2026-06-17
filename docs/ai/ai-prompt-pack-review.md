# Sartiarum — AI Prompt Pack Review (Day 3 Prep)

**What this is:** an analysis of the five uploaded files against everything already built (the Phase-1 schema, the scaffolding stubs in `phase-1-build-kickoff.md`, the tech stack, and the phase plan). Verdict per file, the cross-cutting fixes that matter, and the open decisions to confirm with product.

**Bottom line:** the pack is solid and correctly scoped to Phase 1 / Day 3. Nothing here is wrong-headed. There are **four reconciliations** to make so the pack and the code/schema agree, and a handful of confirmations. I've re-emitted the four files that needed edits; `system-prompts.md` is confirmed unchanged.

---

## Verdict summary

| File | Status | What I did |
| --- | --- | --- |
| `system-prompts.md` | ✅ **Confirmed, no change** | Internally consistent and well-written. Keep your existing file. |
| `task-prompts.md` | ✏️ **Updated (minor)** | Defined the runtime variables precisely (prevents integration bugs); clarified replacement-ready output. |
| `model-routing-and-costs.md` | ✏️ **Updated** | Reconciled tier terminology; concretized the "bounded" caps; aligned the router signature + AI SDK v5 param names. |
| `upstash-rate-limits-and-usage.md` | ✏️ **Updated** | Reconciled tier terminology; specified the `lib/usage/` module shape; made the trial policy coherent with the 7-day trial. |
| `README.md` | ✏️ **Updated (minor)** | Pointed at real file/function locations; flagged the `ai_usage` column additions; added the tier-terminology pointer. |

---

## The four cross-cutting reconciliations

### 1. Tier terminology — `trial`/`pro` is a *derived* value, not a stored "plan" (most important)

The pack refers to a user **"plan (`trial`, `pro`)."** Our schema (`phase-1-schema.sql`) doesn't store that. It stores:

- `subscriptions.status` — `trialing | active | past_due | canceled` (billing state)
- `subscriptions.plan` — `monthly | annual` (billing cadence)

There is no `trial`/`pro` column. So `trial`/`pro` must be a **tier derived at request time** from `status`, used by the router and the limiter. Define it once and reuse it everywhere:

```ts
// lib/usage/tier.ts
export type Tier = 'trial' | 'pro'

export function deriveTier(
  sub: { status: string; trialEndsAt: Date | null } | null,
): Tier | null {
  if (!sub) return null
  if (sub.status === 'active') return 'pro'
  if (sub.status === 'trialing' && sub.trialEndsAt && sub.trialEndsAt > new Date()) return 'trial'
  return null // past_due | canceled | expired trial → blocked
}
```

| subscription.status | derived tier | access |
| --- | --- | --- |
| `active` | `pro` | full (premium gated to quality mode) |
| `trialing` (not expired) | `trial` | fast/standard, trial limits |
| `trialing` (expired) | — | blocked → upsell |
| `past_due` / `canceled` | — | blocked → upsell |

The two updated files now say **"tier (`trial`/`pro`), derived from subscription status"** instead of "plan."

### 2. `ai_usage` needs new columns (the README's `prompt_version` has nowhere to go)

`README.md` calls for logging `prompt_version`, and the routing/usage docs imply logging the tier and fallback reason — but the current `ai_usage` table has none of these. Add them:

```sql
alter table public.ai_usage
  add column if not exists prompt_version text,   -- e.g. 'task.write.v1'
  add column if not exists tier            text,   -- 'trial' | 'pro' at request time
  add column if not exists latency_ms      int,
  add column if not exists request_id      text,
  add column if not exists fallback_reason text;   -- null unless a fallback fired
```

Fold this into `phase-1-schema.sql` (Day 1) so Day 3 instrumentation has somewhere to write. I can apply that edit to the schema file on request.

### 3. Prompt composition lives in code as base + task + safety (replaces the `systemFor` stub)

The scaffolding's `lib/ai/prompts.ts` had a single `systemFor()` that baked tone/length/audience into one string. The pack's model is better and should win: a **static** `global.base.v1` + **per-action** task additions (which carry `{{tone}}/{{length}}/{{audience}}`) + appended `global.safety-lite.v1`. So update `prompts.ts` to *compose and version* rather than hand-roll:

```ts
// lib/ai/prompts.ts  (shape, not full text)
import { GLOBAL_BASE, GLOBAL_SAFETY, GLOBAL_AUTOCOMPLETE, TASK } from './prompt-pack'

type Vars = { tone?: string; length?: string; audience?: string }

export function composePrompt(action: Action, vars: Vars) {
  if (action === 'autocomplete') {
    return { system: GLOBAL_AUTOCOMPLETE, promptVersion: 'task.autocomplete.v1' }
  }
  const t = TASK[action] // { systemAdditions(vars), version }
  return {
    system: [GLOBAL_BASE, t.systemAdditions(vars), GLOBAL_SAFETY].join('\n\n'),
    promptVersion: t.version,
  }
}
```

Then the route logs `promptVersion` into `ai_usage.prompt_version` in `onFinish`. **Net:** delete the old `systemFor`; tone/length/audience come from the task layer per the pack, not the base.

> Note: `global.voice-lock.v1` is appended only when a voice profile is active (Phase 2), and `task.research-grounded` / `task.coach-feedback` / `task.citation-format` are the Phase 2/3 slots — all correctly deferred in the pack.

### 4. `lib/usage/` is three things, called as one gate

`upstash-rate-limits-and-usage.md` describes entitlement → rate-limit → budget. The Phase-1 stub only did the entitlement check. Split into focused modules and compose them:

```
lib/usage/
  tier.ts          deriveTier()
  ratelimit.ts     Upstash sliding windows per tier+action
  budget.ts        daily/monthly token budget per tier (counters in Upstash, truth in ai_usage)
  gate.ts          assertCanGenerate({ userId, action, inputChars }) -> { ok, tier, reason? }
```

`gate.ts` runs: resolve subscription → `deriveTier` (block if null) → `ratelimit` → `budget` → return `{ ok, tier }`. Every AI route calls `gate.assertCanGenerate(...)` before `streamText`, then writes the usage row in `onFinish`. This replaces the single `assertCanGenerate` stub from the kickoff doc.

---

## Smaller confirmations & notes

- **AI SDK v5 param names (align the code to these):** the per-action caps map to **`maxOutputTokens`** in `streamText` (renamed from `maxTokens` in v5), and token logging reads **`usage.inputTokens` / `usage.outputTokens`** in `onFinish`. The pack's caps are correct; just wire them to `maxOutputTokens`.
- **Concrete caps:** `model-routing-and-costs.md` §6 left rewrite/expand bounds as "bounded" and `write` as "length profile." The updated file gives real numbers (rewrite `clamp(input×1.25, 256, 1500)`, expand `clamp(input×2.0, 384, 2000)`, write Short≈400 / Medium≈900 / Long≈1800) so they're implementable as-is.
- **Autocomplete: 60 tokens vs "max two sentences."** Not a conflict — the **60-token cap is the hard stop**; "one sentence, occasionally two" is the stylistic guide. The updated routing file states the token cap is authoritative.
- **`summarize` input variable:** `task.summarize` used `{{source_text}}` while rewrite/expand use `{{selection}}`. Clarified in the updated `task-prompts.md`: `source_text` = the selection, or the **whole document** when nothing is selected (summarize is the one action that sensibly targets the full doc).
- **`global.base.v1` "return final answer text only"** matches the editor's needs (text streams straight into the doc) — confirmed and important; keep it strict.
- **Model IDs are placeholders.** The `MODELS.premium` / `MODELS.fallbackFast` examples are illustrative — pick the actual OpenRouter model slugs at build time and keep them in config, not in routes.

---

## Open decisions to confirm (product calls, not engineering)

1. **Fail-open vs fail-closed when Upstash is down.** The usage doc proposes fail-closed for trial, conservative fail-open for paid. Confirm this is the intended business stance (it trades a little abuse risk for not blocking paying users during an outage).
2. **Final trial numbers.** The doc's starting values are 20 req/hr + 100 req/day for trial. This **supersedes the looser "~50 generations" figure** from the overview. Confirm the numbers, and confirm the trial still hard-ends at 7 days regardless of remaining rate budget.
3. **Premium gating.** Confirm premium is **pro-tier + explicit quality mode** (and/or fallback escalation) only — never the default — so cost stays predictable.
4. **`ai_usage` column additions** (reconciliation #2) — confirm you want these folded into `phase-1-schema.sql` and I'll apply it.

---

## Files in this update

- `model-routing-and-costs.md` — updated (tier terminology, concrete caps, router signature, v5 param note).
- `upstash-rate-limits-and-usage.md` — updated (tier terminology, `lib/usage/` shape, coherent trial policy, status→tier map).
- `task-prompts.md` — updated (precise variable definitions, replacement-ready output note).
- `README.md` — updated (real locations, `prompt_version`/`ai_usage` note, tier pointer).
- `system-prompts.md` — **confirmed, unchanged** (keep your existing file).

Everything else in the pack is approved as-is.
