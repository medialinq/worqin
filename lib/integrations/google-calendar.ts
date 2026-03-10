import { decrypt } from '@/lib/crypto'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'
const SCOPES =
  'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email'

function getCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('Google Calendar credentials not configured')
  }
  return { clientId, clientSecret }
}

export function getGoogleAuthUrl(redirectUri: string, state: string): string {
  const { clientId } = getCredentials()
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `${GOOGLE_AUTH_URL}?${params}`
}

export async function exchangeGoogleCode(
  code: string,
  redirectUri: string,
): Promise<{
  accessToken: string
  refreshToken: string
  expiresAt: string
  email: string
}> {
  const { clientId, clientSecret } = getCredentials()

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('[Google OAuth Error]', res.status, body)
    throw new Error('Failed to exchange authorization code')
  }

  const data = await res.json()
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

  // Get user email
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${data.access_token}` },
  })
  const userInfo = await userRes.json()

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    email: userInfo.email,
  }
}

export async function refreshGoogleToken(encryptedRefreshToken: string): Promise<{
  accessToken: string
  expiresAt: string
}> {
  const { clientId, clientSecret } = getCredentials()
  const refreshToken = decrypt(encryptedRefreshToken)

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) throw new Error('Failed to refresh Google token')

  const data = await res.json()
  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  }
}

export interface GoogleCalendarEvent {
  id: string
  summary: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  location?: string
  recurringEventId?: string
}

export async function fetchGoogleEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string,
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })

  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  if (!res.ok) throw new Error('Failed to fetch Google Calendar events')

  const data = await res.json()
  return data.items ?? []
}
