'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth'
import { ok, err, dbErr, type ActionResult } from '@/lib/action-utils'
import {
  createLeaveSchema,
  updateLeaveSchema,
  deleteLeaveSchema,
} from '@/lib/validations'

// ── Types ────────────────────────────────────────────

type LeaveEntry = {
  id: string
  organization_id: string
  user_id: string
  date: string
  type: string
  notes: string | null
  created_at: string
}

// ── Create ───────────────────────────────────────────

export async function createLeave(raw: unknown): Promise<ActionResult<LeaveEntry>> {
  const parsed = createLeaveSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId, organizationId } = await getAuthContext()

  const { data, error } = await supabase
    .from('leave_entries')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      date: parsed.data.date,
      type: parsed.data.type,
      notes: parsed.data.notes ?? null,
    })
    .select()
    .single()

  if (error) {
    // Handle unique constraint violation (user_id, date)
    if (error.code === '23505') {
      return err('Er is al een verlofregistratie voor deze datum')
    }
    return dbErr(error)
  }

  revalidatePath('/financial/leave')
  return ok(data as LeaveEntry)
}

// ── Update ───────────────────────────────────────────

export async function updateLeave(raw: unknown): Promise<ActionResult<LeaveEntry>> {
  const parsed = updateLeaveSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId } = await getAuthContext()
  const { id, ...fields } = parsed.data

  // Map camelCase input to snake_case DB columns
  const updates: Record<string, unknown> = {}
  if (fields.date !== undefined) updates.date = fields.date
  if (fields.type !== undefined) updates.type = fields.type
  if (fields.notes !== undefined) updates.notes = fields.notes

  const { data, error } = await supabase
    .from('leave_entries')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    // Handle unique constraint violation when changing date
    if (error.code === '23505') {
      return err('Er is al een verlofregistratie voor deze datum')
    }
    return dbErr(error)
  }

  revalidatePath('/financial/leave')
  return ok(data as LeaveEntry)
}

// ── Delete ───────────────────────────────────────────

export async function deleteLeave(raw: unknown): Promise<ActionResult<void>> {
  const parsed = deleteLeaveSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId } = await getAuthContext()

  const { error } = await supabase
    .from('leave_entries')
    .delete()
    .eq('id', parsed.data.id)
    .eq('user_id', userId)

  if (error) return dbErr(error)

  revalidatePath('/financial/leave')
  return ok()
}
