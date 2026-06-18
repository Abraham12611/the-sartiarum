import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { documents } from '@/lib/db/schema'

export type WriterAiSettings = {
  tone: string
  length: string
  audience: string
}

type ResolveSettingsArgs = {
  userId: string
  documentId?: unknown
  fallbackTone?: unknown
  fallbackLength?: unknown
  fallbackAudience?: unknown
}

const DEFAULT_SETTINGS: WriterAiSettings = {
  tone: 'Balanced',
  length: 'Medium',
  audience: 'General',
}

function fromUnknown(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

export async function resolveWriterAiSettings(args: ResolveSettingsArgs): Promise<WriterAiSettings> {
  const documentId = typeof args.documentId === 'string' ? args.documentId.trim() : ''

  if (documentId) {
    const [document] = await db
      .select({
        tone: documents.tone,
        length: documents.length,
        audience: documents.audience,
      })
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.ownerId, args.userId)))
      .limit(1)

    if (document) {
      return {
        tone: document.tone,
        length: document.length,
        audience: document.audience,
      }
    }
  }

  return {
    tone: fromUnknown(args.fallbackTone, DEFAULT_SETTINGS.tone),
    length: fromUnknown(args.fallbackLength, DEFAULT_SETTINGS.length),
    audience: fromUnknown(args.fallbackAudience, DEFAULT_SETTINGS.audience),
  }
}
