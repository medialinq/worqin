import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto'
import { exchangeGoogleCode } from '@/lib/integrations/google-calendar'
import { exchangeMicrosoftCode } from '@/lib/integrations/microsoft-calendar'
import { syncCalendarEvents } from '@/lib/integrations/calendar-sync'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const error = request.nextUrl.searchParams.get('error')

  // User denied access
  if (error) {
    return NextResponse.redirect(
      new URL('/settings/calendar?error=denied', request.url),
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/settings/calendar?error=invalid', request.url),
    )
  }

  // Verify CSRF state
  const cookieStore = await cookies()
  const storedState = cookieStore.get('agenda_oauth_state')?.value
  cookieStore.delete('agenda_oauth_state')

  if (!storedState) {
    return NextResponse.redirect(
      new URL('/settings/calendar?error=expired', request.url),
    )
  }

  const [provider, expectedState] = storedState.split(':')
  if (
    state !== expectedState ||
    (provider !== 'GOOGLE' && provider !== 'MICROSOFT')
  ) {
    return NextResponse.redirect(
      new URL('/settings/calendar?error=csrf', request.url),
    )
  }

  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Get user's organization
  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(
      new URL('/settings/calendar?error=no_profile', request.url),
    )
  }

  try {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      `${request.nextUrl.protocol}//${request.nextUrl.host}`
    const redirectUri = `${siteUrl}/api/agenda/callback`

    // Exchange code for tokens (provider-specific)
    const exchangeFn =
      provider === 'GOOGLE' ? exchangeGoogleCode : exchangeMicrosoftCode
    const { accessToken, refreshToken, expiresAt, email } = await exchangeFn(
      code,
      redirectUri,
    )

    // Check for existing connection with same provider + user
    const { data: existing } = await supabase
      .from('calendar_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .maybeSingle()

    if (existing) {
      // Update existing connection
      await supabase
        .from('calendar_connections')
        .update({
          access_token: encrypt(accessToken),
          refresh_token: encrypt(refreshToken),
          token_expires_at: expiresAt,
          account_email: email,
          is_active: true,
        })
        .eq('id', existing.id)

      // Sync events for updated connection
      await syncCalendarEvents(existing.id)
    } else {
      // Create new connection
      const { data: newConn } = await supabase
        .from('calendar_connections')
        .insert({
          organization_id: profile.organization_id,
          user_id: user.id,
          provider,
          account_email: email,
          access_token: encrypt(accessToken),
          refresh_token: encrypt(refreshToken),
          token_expires_at: expiresAt,
          is_active: true,
        })
        .select('id')
        .single()

      if (newConn) {
        // Sync events for new connection
        await syncCalendarEvents(newConn.id)
      }
    }

    return NextResponse.redirect(
      new URL('/settings/calendar?success=connected', request.url),
    )
  } catch (err) {
    console.error('[Agenda Callback Error]', err)
    return NextResponse.redirect(
      new URL('/settings/calendar?error=exchange_failed', request.url),
    )
  }
}
