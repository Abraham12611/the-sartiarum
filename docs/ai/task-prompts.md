# Task Prompts

These are the exact prompt templates intended for Day 3 integration.

## Shared runtime variables
- `{{tone}}` (e.g. Balanced, Formal, Conversational)
- `{{length}}` (Short, Medium, Long)
- `{{audience}}` (General, Technical, Academic, Business)
- `{{user_prompt}}`, `{{selection}}`, `{{source_text}}`, `{{preceding_text}}`

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
- Maintain continuity so expansion can replace original selection directly.
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

---

## Future prompt slots (for Day 3+)
- `task.research-grounded.v1` (Phase 3)
- `task.coach-feedback.v1` (Phase 2)
- `task.citation-format.v1` (Phase 3)
