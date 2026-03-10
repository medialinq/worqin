import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getGoogleAuthUrl } from '@/lib/integrations/google-calendar'
import { getMicrosoftAuthUrl } from '@/lib/integrations/microsoft-calendar'

export async function GET(request: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const provider = request.nextUrl.searchParams.get('provider')?.toUpperCase()
  if (provider !== 'GOOGLE' && provider !== 'MICROSOFT') {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
  }

  // Generate CSRF state token
  const state = randomBytes(32).toString('hex')

  // Store state in httpOnly cookie (5 min expiry)
  const cookieStore = await cookies()
  cookieStore.set('agenda_oauth_state', `${provider}:${state}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 300,
    path: '/',
  })

  // Build redirect URI
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  const redirectUri = `${siteUrl}/api/agenda/callback`

  // Generate provider-specific auth URL
  const authUrl =
    provider === 'GOOGLE'
      ? getGoogleAuthUrl(redirectUri, state)
      : getMicrosoftAuthUrl(redirectUri, state)

  return NextResponse.redirect(authUrl)
}
