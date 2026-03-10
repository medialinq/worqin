import { decrypt } from '@/lib/crypto'

const MS_AUTH_URL =
  'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
const MS_TOKEN_URL =
  'https://login.microsoftonline.com/common/oauth2/v2.0/token'
const GRAPH_API = 'https://graph.microsoft.com/v1.0'
const SCOPES = 'Calendars.Read User.Read offline_access'

function getCredentials() {
  const clientId = process.env.MICROSOFT_CLIENT_ID
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('Microsoft Calendar credentials not configured')
  }
  return { clientId, clientSecret }
}

export function getMicrosoftAuthUrl(redirectUri: string, state: string): string {
  const { clientId } = getCredentials()
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    response_mode: 'query',
    prompt: 'consent',
    state,
  })
  return `${MS_AUTH_URL}?${params}`
}

export async function exchangeMicrosoftCode(
  code: string,
  redirectUri: string,
): Promise<{
  accessToken: string
  refreshToken: string
  expiresAt: string
  email: string
}> {
  const { clientId, clientSecret } = getCredentials()

  const res = await fetch(MS_TOKEN_URL, {
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
    console.error('[Microsoft OAuth Error]', res.status, body)
    throw new Error('Failed to exchange authorization code')
  }

  const data = await res.json()
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

  // Get user email from Graph API
  const userRes = await fetch(`${GRAPH_API}/me`, {
    headers: { Authorization: `Bearer ${data.access_token}` },
  })
  const userInfo = await userRes.json()

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    email: userInfo.mail || userInfo.userPrincipalName,
  }
}

export async function refreshMicrosoftToken(encryptedRefreshToken: string): Promise<{
  accessToken: string
  expiresAt: string
}> {
  const { clientId, clientSecret } = getCredentials()
  const refreshToken = decrypt(encryptedRefreshToken)

  const res = await fetch(MS_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      scope: SCOPES,
    }),
  })

  if (!res.ok) throw new Error('Failed to refresh Microsoft token')

  const data = await res.json()
  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  }
}

export interface MicrosoftCalendarEvent {
  id: string
  subject: string
  start: { dateTime: string; timeZone: string }
  end: { dateTime: string; timeZone: string }
  location?: { displayName?: string }
  seriesMasterId?: string
}

export async function fetchMicrosoftEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string,
): Promise<MicrosoftCalendarEvent[]> {
  const params = new URLSearchParams({
    startDateTime: timeMin,
    endDateTime: timeMax,
    $top: '250',
    $orderby: 'start/dateTime',
    $select: 'id,subject,start,end,location,seriesMasterId',
  })

  const res = await fetch(`${GRAPH_API}/me/calendarView?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) throw new Error('Failed to fetch Microsoft Calendar events')

  const data = await res.json()
  return data.value ?? []
}
