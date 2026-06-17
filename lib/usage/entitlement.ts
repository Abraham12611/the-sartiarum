import { assertCanGenerate as gateAssertCanGenerate } from '@/lib/usage/gate'

export async function assertCanGenerate(
  userId: string,
): Promise<{ ok: boolean; reason?: string }> {
  const result = await gateAssertCanGenerate({
    userId,
    action: 'write',
    inputChars: 1,
  })

  if (!result.ok) return { ok: false, reason: result.reason }
  return { ok: true }
}
