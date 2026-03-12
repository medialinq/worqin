import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from '@/lib/admin/session'

// Validate origin against allowed hosts to prevent open redirect via header spoofing
function getSafeOrigin(request: NextRequest): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl) return siteUrl

  // Fallback: validate x-forwarded-host against allowed hosts
  const allowedHosts = new Set(
    (process.env.ALLOWED_HOSTS || 'localhost:3000').split(',').map((h) => h.trim())
  )
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  if (host && allowedHosts.has(host)) {
    const proto = request.headers.get('x-forwarded-proto') || 'https'
    return `${proto}://${host}`
  }

  return request.nextUrl.origin
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Admin routes — separate auth, checked before Supabase auth
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    const isValidAdmin = token ? verifyAdminSessionToken(token) : false
    if (!isValidAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — IMPORTANT: do not remove
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public routes — no auth required
  // SECURITY: Only specific routes are public, not all /api/* routes
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify') ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/admin/login')

  const origin = getSafeOrigin(request)

  // Protect all non-public routes
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(`${origin}/login`)
  }

  // Redirect logged-in users away from auth pages
  if (
    user &&
    (pathname.startsWith('/login') || pathname.startsWith('/register'))
  ) {
    // Check onboarding status to avoid sending non-onboarded users to dashboard
    const { data: profile } = await supabase
      .from('users')
      .select('onboarded_at')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.onboarded_at) {
      return NextResponse.redirect(`${origin}/onboarding`)
    }
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|brand/|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
