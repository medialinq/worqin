import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/crypto'
import {
  fetchGoogleEvents,
  refreshGoogleToken,
  type GoogleCalendarEvent,
} from './google-calendar'
import {
  fetchMicrosoftEvents,
  refreshMicrosoftToken,
  type MicrosoftCalendarEvent,
} from './microsoft-calendar'

type Provider = 'GOOGLE' | 'MICROSOFT'

interface CalendarConnection {
  id: string
  provider: Provider
  access_token: string
  refresh_token: string
  token_expires_at: string | null
}

/**
 * Ensure the access token is fresh. If expired, refresh it and update DB.
 * Returns a usable (decrypted) access token.
 */
async function ensureFreshToken(connection: CalendarConnection): Promise<string> {
  const expiresAt = connection.token_expires_at
    ? new Date(connection.token_expires_at)
    : new Date(0)

  // If token expires in more than 5 minutes, use current one
  if (expiresAt.getTime() - Date.now() > 5 * 60 * 1000) {
    return decrypt(connection.access_token)
  }

  // Refresh the token
  const refreshFn =
    connection.provider === 'GOOGLE' ? refreshGoogleToken : refreshMicrosoftToken

  const { accessToken, expiresAt: newExpiry } = await refreshFn(
    connection.refresh_token,
  )

  // Update DB with new encrypted access token
  const supabase = await createClient()
  await supabase
    .from('calendar_connections')
    .update({
      access_token: encrypt(accessToken),
      token_expires_at: newExpiry,
      last_synced_at: new Date().toISOString(),
    })
    .eq('id', connection.id)

  return accessToken
}

/**
 * Sync calendar events for a given connection.
 * Fetches events for the next 30 days and upserts them.
 */
export async function syncCalendarEvents(connectionId: string): Promise<{
  synced: number
  error?: string
}> {
  const supabase = await createClient()

  const { data: connection, error: fetchError } = await supabase
    .from('calendar_connections')
    .select('id, provider, access_token, refresh_token, token_expires_at')
    .eq('id', connectionId)
    .single()

  if (fetchError || !connection) {
    return { synced: 0, error: 'Connection not found' }
  }

  try {
    const accessToken = await ensureFreshToken(connection as CalendarConnection)

    const now = new Date()
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const timeMin = now.toISOString()
    const timeMax = thirtyDaysLater.toISOString()

    let rows: {
      connection_id: string
      provider_event_id: string
      title: string
      start_at: string
      end_at: string
      location: string | null
      is_recurring: boolean
    }[]

    if (connection.provider === 'GOOGLE') {
      const events = await fetchGoogleEvents(accessToken, timeMin, timeMax)
      rows = events.map((e: GoogleCalendarEvent) => ({
        connection_id: connectionId,
        provider_event_id: e.id,
        title: e.summary || '(No title)',
        start_at: e.start.dateTime || e.start.date || timeMin,
        end_at: e.end.dateTime || e.end.date || timeMax,
        location: e.location || null,
        is_recurring: !!e.recurringEventId,
      }))
    } else {
      const events = await fetchMicrosoftEvents(accessToken, timeMin, timeMax)
      rows = events.map((e: MicrosoftCalendarEvent) => ({
        connection_id: connectionId,
        provider_event_id: e.id,
        title: e.subject || '(No title)',
        start_at: new Date(e.start.dateTime + 'Z').toISOString(),
        end_at: new Date(e.end.dateTime + 'Z').toISOString(),
        location: e.location?.displayName || null,
        is_recurring: !!e.seriesMasterId,
      }))
    }

    if (rows.length === 0) {
      // Update last_synced_at even if no events
      await supabase
        .from('calendar_connections')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', connectionId)
      return { synced: 0 }
    }

    // Upsert events (conflict on connection_id + provider_event_id)
    const { error: upsertError } = await supabase
      .from('calendar_events')
      .upsert(rows, {
        onConflict: 'connection_id,provider_event_id',
        ignoreDuplicates: false,
      })

    if (upsertError) {
      console.error('[Sync Error]', upsertError)
      return { synced: 0, error: 'Failed to save events' }
    }

    // Update last_synced_at
    await supabase
      .from('calendar_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', connectionId)

    return { synced: rows.length }
  } catch (err) {
    console.error('[Calendar Sync Error]', err)
    return { synced: 0, error: 'Sync failed' }
  }
}
