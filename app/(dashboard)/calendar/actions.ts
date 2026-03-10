'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth'
import { ok, err, dbErr, type ActionResult } from '@/lib/action-utils'

export async function confirmEvent(
  eventId: string,
  clientId?: string | null,
): Promise<ActionResult> {
  if (!eventId) return err('Event ID is required')

  const { supabase, userId } = await getAuthContext()

  // Verify user owns this event (through connection)
  const { data: event, error: fetchError } = await supabase
    .from('calendar_events')
    .select('id, connection_id, calendar_connections!inner(user_id)')
    .eq('id', eventId)
    .single()

  if (fetchError || !event) return err('Event not found')

  const conn = event.calendar_connections as unknown as { user_id: string }
  if (conn.user_id !== userId) return err('Not authorized')

  const updates: Record<string, unknown> = {
    confirmed_at: new Date().toISOString(),
  }
  if (clientId !== undefined) {
    updates.suggested_client_id = clientId
    updates.is_billable = !!clientId
  }

  const { error } = await supabase
    .from('calendar_events')
    .update(updates)
    .eq('id', eventId)

  if (error) return dbErr(error)

  revalidatePath('/calendar')
  revalidatePath('/dashboard')
  return ok()
}

export async function bulkConfirmEvents(
  eventIds: string[],
): Promise<ActionResult<{ confirmed: number }>> {
  if (!eventIds.length) return err('No events provided')

  const { supabase, userId } = await getAuthContext()

  // Verify all events belong to user
  const { data: events, error: fetchError } = await supabase
    .from('calendar_events')
    .select('id, calendar_connections!inner(user_id)')
    .in('id', eventIds)

  if (fetchError) return dbErr(fetchError)

  const ownedIds = (events ?? [])
    .filter((e) => {
      const conn = e.calendar_connections as unknown as { user_id: string }
      return conn.user_id === userId
    })
    .map((e) => e.id)

  if (ownedIds.length === 0) return err('No valid events found')

  const { error } = await supabase
    .from('calendar_events')
    .update({ confirmed_at: new Date().toISOString() })
    .in('id', ownedIds)

  if (error) return dbErr(error)

  revalidatePath('/calendar')
  revalidatePath('/dashboard')
  return ok({ confirmed: ownedIds.length })
}

export async function createTimerFromEvent(
  eventId: string,
  clientId?: string | null,
  projectId?: string | null,
): Promise<ActionResult> {
  if (!eventId) return err('Event ID is required')

  const { supabase, userId, organizationId } = await getAuthContext()

  // Fetch event details
  const { data: event, error: fetchError } = await supabase
    .from('calendar_events')
    .select('*, calendar_connections!inner(user_id)')
    .eq('id', eventId)
    .single()

  if (fetchError || !event) return err('Event not found')

  const conn = event.calendar_connections as unknown as { user_id: string }
  if (conn.user_id !== userId) return err('Not authorized')

  // Check for active timer
  const { data: activeTimers } = await supabase
    .from('time_entries')
    .select('id')
    .eq('user_id', userId)
    .is('stopped_at', null)
    .limit(1)

  if (activeTimers && activeTimers.length > 0) {
    return err('You already have an active timer. Stop it first.')
  }

  // Snapshot client rates
  let hourlyRateSnapshot: number | null = null
  let kmRateSnapshot: number | null = null

  if (clientId) {
    const { data: client } = await supabase
      .from('clients')
      .select('hourly_rate, km_rate')
      .eq('id', clientId)
      .eq('organization_id', organizationId)
      .single()

    if (client) {
      hourlyRateSnapshot = client.hourly_rate
      kmRateSnapshot = client.km_rate
    }
  }

  const { error: insertError } = await supabase
    .from('time_entries')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      client_id: clientId ?? null,
      project_id: projectId ?? null,
      calendar_event_id: event.provider_event_id,
      type: clientId ? 'BILLABLE' : 'NON_BILLABLE',
      description: event.title,
      started_at: event.start_at,
      hourly_rate_snapshot: hourlyRateSnapshot,
      km_rate_snapshot: kmRateSnapshot,
    })

  if (insertError) return dbErr(insertError)

  // Mark event as confirmed
  await supabase
    .from('calendar_events')
    .update({
      confirmed_at: new Date().toISOString(),
      suggested_client_id: clientId ?? null,
      is_billable: !!clientId,
    })
    .eq('id', eventId)

  revalidatePath('/calendar')
  revalidatePath('/dashboard')
  revalidatePath('/timeline')
  return ok()
}
