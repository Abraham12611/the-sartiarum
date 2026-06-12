import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Note: Next.js 16 shows a deprecation warning for this filename.
// We'll rename to proxy.ts once the App Router migration guide confirms the stable API.
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
