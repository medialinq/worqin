import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function getExternalOrigin(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  if (host) return `${proto}://${host}`
  return process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const origin = getExternalOrigin(request)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'

  if (!code) {
    return NextResponse.redirect(`${origin}/login`)
  }

  let response = NextResponse.redirect(`${origin}${next}`)

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
          response = NextResponse.redirect(`${origin}${next}`)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login`)
  }

  // After exchange, check if user profile exists
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('id, onboarded_at')
      .eq('id', user.id)
      .single()

    if (!profile) {
      // First login — create org + user via service role
      await createUserProfile(user)
      // Redirect to onboarding
      response = NextResponse.redirect(`${origin}/onboarding`)
      // Re-set cookies on the new response
      request.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value)
      })
      return response
    }

    if (profile.onboarded_at) {
      // Already onboarded, go to dashboard
      response = NextResponse.redirect(`${origin}/dashboard`)
      request.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value)
      })
      return response
    }
  }

  return response
}

async function createUserProfile(user: { id: string; email?: string; user_metadata: Record<string, unknown> }) {
  // Use service role to bypass RLS for initial setup
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const name = (user.user_metadata.name as string) || user.email?.split('@')[0] || ''
  const company = (user.user_metadata.company as string) || `${name}'s bedrijf`
  const slug = company
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50) + '-' + user.id.slice(0, 8)

  // Create organization
  const { data: org, error: orgError } = await supabaseAdmin
    .from('organizations')
    .insert({
      name: company,
      slug,
      plan: 'TRIAL',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('id')
    .single()

  if (orgError || !org) {
    console.error('Failed to create organization:', orgError)
    return
  }

  // Create user profile
  const { error: userError } = await supabaseAdmin.from('users').insert({
    id: user.id,
    organization_id: org.id,
    email: user.email || '',
    name,
    role: 'OWNER',
  })

  if (userError) {
    console.error('Failed to create user:', userError)
    return
  }

  // Set organization_id in auth metadata for RLS
  await supabaseAdmin.auth.admin.updateUserById(user.id, {
    app_metadata: { organization_id: org.id, role: 'OWNER' },
  })
}
