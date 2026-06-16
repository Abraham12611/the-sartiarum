# Task Prompts

> Updated 2026-06-16 — defined runtime variables precisely; clarified replacement-ready output. Prompt text otherwise unchanged.

These are the exact prompt templates intended for Day 3 integration.

## Shared runtime variables
Resolve these from the request before composing the prompt:

- `{{tone}}` — Balanced, Formal, Conversational, … (from Writer settings)
- `{{length}}` — Short, Medium, Long (from Writer settings)
- `{{audience}}` — General, Technical, Academic, Business (from Writer settings)
- `{{user_prompt}}` — text from the Compose prompt box (write, brainstorm)
- `{{selection}}` — the currently highlighted text in the editor (rewrite, expand)
- `{{source_text}}` — the text to summarize: the **selection**, or the **whole document** when nothing is selected (summarize is the one action that sensibly targets the full doc)
- `{{preceding_text}}` — the text immediately before the cursor (autocomplete)

**Output contract:** for `rewrite` and `expand`, the output must be **replacement-ready** — it directly replaces `{{selection}}`, with no surrounding quotes, labels, or commentary.

## Length hints
- `Short`: Keep concise. Target compact output.
- `Medium`: Balanced detail.
- `Long`: More depth, examples, and elaboration.

---

## task.write.v1
### System additions
```text
Action: WRITE
- Generate original draft text from the user's prompt.
- Tone: {{tone}}
- Audience: {{audience}}
- Length guidance: {{length}}
- Keep structure logical and coherent.
- If prompt is broad, choose a practical, high-value angle.
```

### User template
```text
Write content for this request:
{{user_prompt}}
```

---

## task.rewrite.v1
### System additions
```text
Action: REWRITE
- Rewrite the text while preserving intent and core meaning.
- Improve clarity, flow, and readability.
- Tone: {{tone}}
- Audience: {{audience}}
- Length guidance: {{length}}
- Keep key facts and named entities unchanged.
- Return replacement-ready text only (no quotes, no labels).
```

### User template
```text
Rewrite this text:
{{selection}}
```

---

## task.summarize.v1
### System additions
```text
Action: SUMMARIZE
- Produce a concise summary focused on key points.
- Keep factual claims faithful to source.
- Tone: {{tone}}
- Audience: {{audience}}
- Length guidance: {{length}}
- No added information beyond source text.
```

### User template
```text
Summarize this text:
{{source_text}}
```

---

## task.expand.v1
### System additions
```text
Action: EXPAND
- Expand the provided text with useful detail, context, and examples.
- Do not change the original intent.
- Tone: {{tone}}
- Audience: {{audience}}
- Length guidance: {{length}}
- Maintain continuity so expansion can replace the original selection directly.
- Return replacement-ready text only (no quotes, no labels).
```

### User template
```text
Expand this text:
{{selection}}
```

---

## task.brainstorm.v1
### System additions
```text
Action: BRAINSTORM
- Return a bullet list of practical ideas.
- Prioritize variety and usefulness.
- Tone: {{tone}}
- Audience: {{audience}}
- Length guidance: {{length}}
- No preamble. Bullets only.
```

### User template
```text
Brainstorm ideas for:
{{user_prompt}}
```

---

## task.autocomplete.v1
### System additions
```text
Action: AUTOCOMPLETE
- Continue the user's current thought from context.
- Maximum two sentences.
- Keep lexical and stylistic continuity.
- Do not introduce unrelated new sections.
```

### User template
```text
Continue from this context:
{{preceding_text}}
```

> Note: the hard stop for autocomplete is the token cap (`maxOutputTokens = 60`, see `model-routing-and-costs.md`); "max two sentences" is the stylistic guide within that budget.

---

## Future prompt slots (for Day 3+)
- `task.research-grounded.v1` (Phase 3)
- `task.coach-feedback.v1` (Phase 2)
- `task.citation-format.v1` (Phase 3)
