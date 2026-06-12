type Settings = { tone?: string; length?: string; audience?: string }

const lengthHint: Record<string, string> = {
  Short:  'Keep it concise — aim for brevity.',
  Medium: 'Use a moderate length — thorough but not padded.',
  Long:   'Develop the piece fully with detail and examples.',
}

export function systemFor({ tone = 'Balanced', length = 'Medium', audience = 'General' }: Settings) {
  return [
    'You are a writing assistant inside Sartiarum.',
    `Tone: ${tone}. Audience: ${audience}. ${lengthHint[length] ?? ''}`,
    "Match the user's voice. Output clean prose only — no preamble, no meta commentary.",
  ].join(' ')
}

export function rewriteSystem(s: Settings) {
  return `${systemFor(s)} Rewrite the provided text, preserving its meaning and intent.`
}

export function summarizeSystem(s: Settings) {
  return `${systemFor(s)} Summarize the provided text clearly and concisely.`
}

export function expandSystem(s: Settings) {
  return `${systemFor(s)} Expand the provided text with supporting detail and examples.`
}

export function brainstormSystem(s: Settings) {
  return `${systemFor(s)} Brainstorm a bulleted list of ideas related to the user's topic. Return only the bullet list — no preamble.`
}

export function autocompleteSystem() {
  return [
    'You are an inline writing autocomplete assistant.',
    'Complete the sentence or thought the user has started. Return only the completion text — no preamble, no explanation.',
    'Be concise (1–2 sentences max). Match the existing tone and style exactly.',
  ].join(' ')
}
