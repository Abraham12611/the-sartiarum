import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_PATHS = ['/login', '/signup', '/forgot-password']

export async function updateSession(request: NextRequest) {
  // If Supabase env vars are not yet configured (e.g. during initial
  // Vercel deployment), pass the request through rather than crashing.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Network error or invalid keys — let the request through;
    // page-level auth checks will catch unauthenticated users.
    return response
  }

  if (!user && request.nextUrl.pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && AUTH_PATHS.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  return response
}
