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

  // Use NEXT_PUBLIC_SITE_URL to avoid localhost redirect behind Traefik proxy
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    `${request.headers.get('x-forwarded-proto') ?? 'https'}://${request.headers.get('x-forwarded-host') ?? request.nextUrl.host}`

  const redirect = (path: string) =>
    NextResponse.redirect(`${siteUrl}${path}`)

  // User denied access
  if (error) {
    return redirect('/settings/calendar?error=denied')
  }

  if (!code || !state) {
    return redirect('/settings/calendar?error=invalid')
  }

  // Verify CSRF state
  const cookieStore = await cookies()
  const storedState = cookieStore.get('agenda_oauth_state')?.value
  cookieStore.delete('agenda_oauth_state')

  if (!storedState) {
    return redirect('/settings/calendar?error=expired')
  }

  const [provider, expectedState] = storedState.split(':')
  if (
    state !== expectedState ||
    (provider !== 'GOOGLE' && provider !== 'MICROSOFT')
  ) {
    return redirect('/settings/calendar?error=csrf')
  }

  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  // Get user's organization
  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return redirect('/settings/calendar?error=no_profile')
  }

  try {
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

    return redirect('/settings/calendar?success=connected')
  } catch (err) {
    console.error('[Agenda Callback Error]', err)
    return redirect('/settings/calendar?error=exchange_failed')
  }
}
