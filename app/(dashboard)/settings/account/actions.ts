'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth'
import { ok, err, type ActionResult } from '@/lib/action-utils'
import {
  updateProfileSchema,
  updateOrganizationSchema,
} from '@/lib/validations'

// ── Types ────────────────────────────────────────────

type Profile = {
  id: string
  name: string
  weekly_hour_goal: number | null
  rounding_interval: string
}

type Organization = {
  id: string
  name: string
}

// ── Update Profile ───────────────────────────────────

export async function updateProfile(
  raw: unknown
): Promise<ActionResult<Profile>> {
  const parsed = updateProfileSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId } = await getAuthContext()

  const updates: Record<string, unknown> = {
    name: parsed.data.name,
    updated_at: new Date().toISOString(),
  }
  if (parsed.data.weeklyHourGoal !== undefined) updates.weekly_hour_goal = parsed.data.weeklyHourGoal
  if (parsed.data.roundingInterval !== undefined) updates.rounding_interval = parsed.data.roundingInterval

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select('id, name, weekly_hour_goal, rounding_interval')
    .single()

  if (error) return err(error.message)

  revalidatePath('/settings/account')
  return ok(data as Profile)
}

// ── Update Organization ──────────────────────────────

export async function updateOrganization(
  raw: unknown
): Promise<ActionResult<Organization>> {
  const parsed = updateOrganizationSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, organizationId } = await getAuthContext()

  const { data, error } = await supabase
    .from('organizations')
    .update({
      name: parsed.data.name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId)
    .select('id, name')
    .single()

  if (error) return err(error.message)

  revalidatePath('/settings/account')
  return ok(data as Organization)
}
