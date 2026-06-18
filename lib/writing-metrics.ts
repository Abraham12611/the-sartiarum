/**
 * Real-time writing quality metrics — all computed client-side.
 * No AI calls needed. Updates on every content change.
 */

export interface WritingMetrics {
  wordCount: number
  sentenceCount: number
  paragraphCount: number
  avgSentenceLength: number
  sentenceLengthVariance: number
  passiveVoicePercent: number
  fillerWordPercent: number
  readabilityScore: number
  readabilityGrade: string
  longestSentence: number
  shortestSentence: number
}

const FILLER_WORDS = new Set([
  'very', 'really', 'just', 'actually', 'basically', 'literally', 'honestly',
  'simply', 'totally', 'completely', 'absolutely', 'definitely', 'certainly',
  'obviously', 'clearly', 'essentially', 'practically', 'virtually',
  'somewhat', 'rather', 'quite', 'fairly', 'pretty', 'kind of', 'sort of',
  'in order to', 'due to the fact that', 'at the end of the day',
  'needless to say', 'it goes without saying', 'that being said',
])

const PASSIVE_PATTERNS = [
  /\b(am|is|are|was|were|be|been|being)\s+(\w+ed|built|caught|chosen|done|drawn|driven|eaten|fallen|felt|found|forgotten|given|gone|grown|heard|held|hidden|hit|kept|known|led|left|lost|made|meant|met|paid|put|read|run|said|seen|sent|set|shown|shut|spoken|spent|stood|taken|taught|thought|told|understood|woken|won|written|worn)\b/gi,
]

function getSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.split(/\s+/).length >= 2)
}

function getWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map(w => w.replace(/[^a-zA-Z'-]/g, ''))
    .filter(w => w.length > 0)
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (word.length <= 3) return 1
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')
  const matches = word.match(/[aeiouy]{1,2}/g)
  return matches ? matches.length : 1
}

function fleschKincaid(words: string[], sentences: string[]): { score: number; grade: string } {
  if (words.length === 0 || sentences.length === 0) {
    return { score: 0, grade: 'N/A' }
  }

  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0)
  const avgSentenceLen = words.length / sentences.length
  const avgSyllables = totalSyllables / words.length

  // Flesch Reading Ease
  const score = Math.round(206.835 - 1.015 * avgSentenceLen - 84.6 * avgSyllables)
  const clamped = Math.max(0, Math.min(100, score))

  let grade: string
  if (clamped >= 90) grade = 'Very Easy'
  else if (clamped >= 80) grade = 'Easy'
  else if (clamped >= 70) grade = 'Fairly Easy'
  else if (clamped >= 60) grade = 'Standard'
  else if (clamped >= 50) grade = 'Fairly Hard'
  else if (clamped >= 30) grade = 'Hard'
  else grade = 'Very Hard'

  return { score: clamped, grade }
}

function computeVariance(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map(v => (v - mean) ** 2)
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length)
}

export function computeWritingMetrics(text: string): WritingMetrics {
  const words = getWords(text)
  const sentences = getSentences(text)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)

  const sentenceLengths = sentences.map(s => s.split(/\s+/).filter(w => w.length > 0).length)
  const avgSentenceLength = sentenceLengths.length > 0
    ? Math.round((sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length) * 10) / 10
    : 0

  // Passive voice detection
  let passiveCount = 0
  for (const sentence of sentences) {
    for (const pattern of PASSIVE_PATTERNS) {
      pattern.lastIndex = 0
      if (pattern.test(sentence)) {
        passiveCount++
        break
      }
    }
  }
  const passiveVoicePercent = sentences.length > 0
    ? Math.round((passiveCount / sentences.length) * 100)
    : 0

  // Filler word detection
  const lowerText = text.toLowerCase()
  let fillerCount = 0
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler.replace(/\s+/g, '\\s+')}\\b`, 'gi')
    const matches = lowerText.match(regex)
    if (matches) fillerCount += matches.length
  }
  const fillerWordPercent = words.length > 0
    ? Math.round((fillerCount / words.length) * 100)
    : 0

  const { score: readabilityScore, grade: readabilityGrade } = fleschKincaid(words, sentences)

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    avgSentenceLength,
    sentenceLengthVariance: Math.round(computeVariance(sentenceLengths) * 10) / 10,
    passiveVoicePercent,
    fillerWordPercent,
    readabilityScore,
    readabilityGrade,
    longestSentence: sentenceLengths.length > 0 ? Math.max(...sentenceLengths) : 0,
    shortestSentence: sentenceLengths.length > 0 ? Math.min(...sentenceLengths) : 0,
  }
}
