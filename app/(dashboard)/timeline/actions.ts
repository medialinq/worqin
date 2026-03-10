'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth'
import { ok, err, type ActionResult } from '@/lib/action-utils'
import {
  createTimeEntrySchema,
  updateTimeEntrySchema,
  stopTimerSchema,
  deleteTimeEntrySchema,
} from '@/lib/validations'

// ── Types ────────────────────────────────────────────

type RoundingInterval = 'NONE' | 'MIN_15' | 'MIN_30' | 'MIN_60'

interface TimeEntry {
  id: string
  organization_id: string
  user_id: string
  client_id: string | null
  project_id: string | null
  started_at: string
  stopped_at: string | null
  duration_mins: number | null
  duration_raw_mins: number | null
  duration_billed_mins: number | null
  description: string | null
  type: string
  is_indirect: boolean
  hourly_rate_snapshot: number | null
  km_rate_snapshot: number | null
  is_export_ready: boolean
  exported_at: string | null
  created_at: string
  updated_at: string
}

// ── Rounding helper (private) ────────────────────────

function roundUpMinutes(minutes: number, interval: RoundingInterval): number {
  if (interval === 'NONE' || minutes <= 0) return Math.max(0, minutes)

  const steps: Record<Exclude<RoundingInterval, 'NONE'>, number> = {
    MIN_15: 15,
    MIN_30: 30,
    MIN_60: 60,
  }

  const step = steps[interval]
  return Math.ceil(minutes / step) * step
}

// ── 1. Start Timer ──────────────────────────────────

export async function startTimer(raw: unknown): Promise<ActionResult<TimeEntry>> {
  const parsed = createTimeEntrySchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId, organizationId } = await getAuthContext()
  const { clientId, projectId, type, description, startedAt } = parsed.data

  // Check for existing active timer (max 1 per user)
  const { data: activeTimers } = await supabase
    .from('time_entries')
    .select('id')
    .eq('user_id', userId)
    .is('stopped_at', null)
    .limit(1)

  if (activeTimers && activeTimers.length > 0) {
    return err('You already have an active timer. Stop it before starting a new one.')
  }

  // Snapshot client rates if client_id provided
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

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      client_id: clientId ?? null,
      project_id: projectId ?? null,
      type,
      description: description ?? null,
      started_at: startedAt ?? new Date().toISOString(),
      hourly_rate_snapshot: hourlyRateSnapshot,
      km_rate_snapshot: kmRateSnapshot,
    })
    .select()
    .single()

  if (error) return err(error.message)

  revalidatePath('/timeline')
  return ok(data as TimeEntry)
}

// ── 2. Stop Timer ───────────────────────────────────

export async function stopTimer(raw: unknown): Promise<ActionResult<TimeEntry>> {
  const parsed = stopTimerSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId, profile } = await getAuthContext()
  const { id } = parsed.data

  // Fetch the active entry (must belong to this user and be running)
  const { data: entry, error: fetchError } = await supabase
    .from('time_entries')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .is('stopped_at', null)
    .single()

  if (fetchError || !entry) return err('Active timer not found')

  const now = new Date()
  const startedAt = new Date(entry.started_at)
  const rawMinutes = Math.max(0, Math.round((now.getTime() - startedAt.getTime()) / 60_000))

  const roundingInterval = (profile.rounding_interval ?? 'NONE') as RoundingInterval
  const roundedMinutes = roundUpMinutes(rawMinutes, roundingInterval)

  // Apply client minimum_minutes for billed duration
  let billedMinutes = roundedMinutes
  if (entry.client_id) {
    const { data: client } = await supabase
      .from('clients')
      .select('minimum_minutes')
      .eq('id', entry.client_id)
      .single()

    if (client?.minimum_minutes && billedMinutes < client.minimum_minutes) {
      billedMinutes = client.minimum_minutes
    }
  }

  const { data, error } = await supabase
    .from('time_entries')
    .update({
      stopped_at: now.toISOString(),
      duration_raw_mins: rawMinutes,
      duration_mins: roundedMinutes,
      duration_billed_mins: billedMinutes,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)

  revalidatePath('/timeline')
  return ok(data as TimeEntry)
}

// ── 3. Update Time Entry ────────────────────────────

export async function updateTimeEntry(raw: unknown): Promise<ActionResult<TimeEntry>> {
  const parsed = updateTimeEntrySchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId, organizationId } = await getAuthContext()
  const { id, clientId, projectId, type, description, durationMins, durationBilledMins, isExportReady } = parsed.data

  // Build update payload — only include provided fields
  const updates: Record<string, unknown> = {}

  if (clientId !== undefined) {
    updates.client_id = clientId

    // Re-snapshot rates when client changes
    if (clientId) {
      const { data: client } = await supabase
        .from('clients')
        .select('hourly_rate, km_rate')
        .eq('id', clientId)
        .eq('organization_id', organizationId)
        .single()

      if (client) {
        updates.hourly_rate_snapshot = client.hourly_rate
        updates.km_rate_snapshot = client.km_rate
      }
    } else {
      updates.hourly_rate_snapshot = null
      updates.km_rate_snapshot = null
    }
  }

  if (projectId !== undefined) updates.project_id = projectId
  if (type !== undefined) updates.type = type
  if (description !== undefined) updates.description = description
  if (durationMins !== undefined) updates.duration_mins = durationMins
  if (durationBilledMins !== undefined) updates.duration_billed_mins = durationBilledMins
  if (isExportReady !== undefined) updates.is_export_ready = isExportReady

  if (Object.keys(updates).length === 0) return err('No fields to update')

  const { data, error } = await supabase
    .from('time_entries')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)
  if (!data) return err('Time entry not found')

  revalidatePath('/timeline')
  return ok(data as TimeEntry)
}

// ── 4. Delete Time Entry ────────────────────────────

export async function deleteTimeEntry(raw: unknown): Promise<ActionResult<void>> {
  const parsed = deleteTimeEntrySchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId } = await getAuthContext()
  const { id } = parsed.data

  // Only allow deleting own, unexported entries
  const { data: entry, error: fetchError } = await supabase
    .from('time_entries')
    .select('id, exported_at')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (fetchError || !entry) return err('Time entry not found')
  if (entry.exported_at) return err('Cannot delete an exported time entry')

  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return err(error.message)

  revalidatePath('/timeline')
  return ok()
}

// ── 5. Toggle Export Ready ──────────────────────────

export async function toggleExportReady(raw: unknown): Promise<ActionResult<TimeEntry>> {
  const parsed = deleteTimeEntrySchema.safeParse(raw) // same shape: { id }
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId } = await getAuthContext()
  const { id } = parsed.data

  // Fetch current value
  const { data: entry, error: fetchError } = await supabase
    .from('time_entries')
    .select('id, is_export_ready')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (fetchError || !entry) return err('Time entry not found')

  const { data, error } = await supabase
    .from('time_entries')
    .update({ is_export_ready: !entry.is_export_ready })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)

  revalidatePath('/timeline')
  return ok(data as TimeEntry)
}
