/**
 * Voice/Style ingestion prompts — analyze writing samples to extract a structured voice profile.
 */

const VOICE_ANALYSIS_SYSTEM = `You are a writing style analyst. Given one or more writing samples from the same author, extract a structured voice profile that captures their unique writing style.

Analyze these dimensions:
1. TONE: Overall emotional quality (e.g., warm, authoritative, playful, serious, conversational, academic)
2. SENTENCE STRUCTURE: Typical patterns (short/punchy, long/flowing, mixed, fragment-heavy, compound-complex)
3. VOCABULARY LEVEL: Word choice sophistication (casual, standard, elevated, technical, poetic)
4. SIGNATURE PATTERNS: Unique habits (e.g., "starts paragraphs with questions", "uses em-dashes frequently", "favors parallel structure", "one-sentence paragraphs for emphasis")
5. RHYTHM: Pacing and cadence (staccato, flowing, varied, periodic)
6. PERSPECTIVE: Point of view tendencies (first person, second person, third person, mixed)
7. FIGURATIVE LANGUAGE: Use of metaphors, analogies, similes (frequent/rare, types used)

Return a JSON object with this exact schema:
{
  "name": string (a short 2-3 word name for this voice, e.g. "Warm Authority" or "Sharp Conversational"),
  "description": string (1-2 sentence summary of the overall voice),
  "tone_keywords": string[] (3-5 tone descriptors),
  "sentence_structure": {
    "avg_length": "short" | "medium" | "long" | "varied",
    "complexity": "simple" | "moderate" | "complex" | "mixed",
    "fragments": boolean,
    "patterns": string[] (2-3 notable structural habits)
  },
  "vocabulary_level": "casual" | "standard" | "elevated" | "technical" | "poetic",
  "signature_patterns": string[] (3-6 distinctive writing habits),
  "rhythm": string (one sentence describing the pacing),
  "perspective": string (primary POV used),
  "figurative_language": string (brief note on metaphor/analogy usage)
}

Return ONLY the JSON object. No preamble. No markdown fences.`

export function composeVoiceAnalysisPrompt(samples: string[]) {
  const combined = samples
    .map((s, i) => `--- Sample ${i + 1} ---\n${s}`)
    .join('\n\n')

  return {
    system: VOICE_ANALYSIS_SYSTEM,
    prompt: `Analyze these writing samples and extract a voice profile:\n\n${combined}`,
    promptVersion: 'voice.analyze.v1',
  }
}
