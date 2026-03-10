'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth'
import { ok, err, dbErr, type ActionResult } from '@/lib/action-utils'
import { syncCalendarEvents } from '@/lib/integrations/calendar-sync'

export async function disconnectCalendar(
  connectionId: string,
): Promise<ActionResult> {
  if (!connectionId) return err('Connection ID is required')

  const { supabase, userId } = await getAuthContext()

  // Verify ownership
  const { data: connection, error: fetchError } = await supabase
    .from('calendar_connections')
    .select('id')
    .eq('id', connectionId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !connection) return err('Connection not found')

  // Deactivate (don't delete -- preserve history)
  const { error } = await supabase
    .from('calendar_connections')
    .update({ is_active: false })
    .eq('id', connectionId)
    .eq('user_id', userId)

  if (error) return dbErr(error)

  revalidatePath('/settings/calendar')
  revalidatePath('/calendar')
  return ok()
}

export async function reconnectCalendar(
  connectionId: string,
): Promise<ActionResult> {
  if (!connectionId) return err('Connection ID is required')

  const { supabase, userId } = await getAuthContext()

  const { data: connection, error: fetchError } = await supabase
    .from('calendar_connections')
    .select('id')
    .eq('id', connectionId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !connection) return err('Connection not found')

  const { error } = await supabase
    .from('calendar_connections')
    .update({ is_active: true })
    .eq('id', connectionId)
    .eq('user_id', userId)

  if (error) return dbErr(error)

  // Trigger sync after reconnect
  await syncCalendarEvents(connectionId)

  revalidatePath('/settings/calendar')
  revalidatePath('/calendar')
  return ok()
}

export async function syncCalendar(
  connectionId: string,
): Promise<ActionResult<{ synced: number }>> {
  if (!connectionId) return err('Connection ID is required')

  const { supabase, userId } = await getAuthContext()

  // Verify ownership
  const { data: connection, error: fetchError } = await supabase
    .from('calendar_connections')
    .select('id')
    .eq('id', connectionId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !connection) return err('Connection not found')

  const result = await syncCalendarEvents(connectionId)
  if (result.error) return err(result.error)

  revalidatePath('/settings/calendar')
  revalidatePath('/calendar')
  return ok({ synced: result.synced })
}
