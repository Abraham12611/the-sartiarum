import { createClient } from '@/lib/supabase/server'
import type { VoiceProfileForPrompt } from '@/lib/ai/prompts'

/**
 * Loads the user's active voice profile (if any) from Supabase.
 * Returns null if no active profile exists.
 */
export async function loadActiveVoiceProfile(userId: string): Promise<VoiceProfileForPrompt | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('voice_profiles')
    .select('raw_analysis')
    .eq('owner_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data?.raw_analysis) return null

  const raw = data.raw_analysis as Record<string, unknown>
  return {
    name: (raw.name as string) || 'Custom Voice',
    description: raw.description as string | undefined,
    tone_keywords: raw.tone_keywords as string[] | undefined,
    sentence_structure: raw.sentence_structure as VoiceProfileForPrompt['sentence_structure'],
    vocabulary_level: raw.vocabulary_level as string | undefined,
    signature_patterns: raw.signature_patterns as string[] | undefined,
    rhythm: raw.rhythm as string | undefined,
    perspective: raw.perspective as string | undefined,
    figurative_language: raw.figurative_language as string | undefined,
  }
}
