'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth'
import { ok, err, dbErr, type ActionResult } from '@/lib/action-utils'
import {
  createProjectSchema,
  updateProjectSchema,
  archiveProjectSchema,
} from '@/lib/validations'

// ── Types ────────────────────────────────────────────

type Project = {
  id: string
  organization_id: string
  client_id: string
  name: string
  description: string | null
  budget_hours: number | null
  hourly_rate: number | null
  color: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── Create ───────────────────────────────────────────

export async function createProject(raw: unknown): Promise<ActionResult<Project>> {
  const parsed = createProjectSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, organizationId } = await getAuthContext()

  // Verify client belongs to the same organization
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id')
    .eq('id', parsed.data.clientId)
    .eq('organization_id', organizationId)
    .single()

  if (clientError || !client) return err('Client not found')

  const { data, error } = await supabase
    .from('projects')
    .insert({
      organization_id: organizationId,
      client_id: parsed.data.clientId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      budget_hours: parsed.data.budgetHours ?? null,
      hourly_rate: parsed.data.hourlyRate ?? null,
      color: parsed.data.color ?? null,
    })
    .select()
    .single()

  if (error) return dbErr(error)

  revalidatePath('/customers/[id]', 'page')
  return ok(data as Project)
}

// ── Update ───────────────────────────────────────────

export async function updateProject(raw: unknown): Promise<ActionResult<Project>> {
  const parsed = updateProjectSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, organizationId } = await getAuthContext()
  const { id, ...fields } = parsed.data

  // Map camelCase input to snake_case DB columns
  const updates: Record<string, unknown> = {}
  if (fields.name !== undefined) updates.name = fields.name
  if (fields.description !== undefined) updates.description = fields.description
  if (fields.budgetHours !== undefined) updates.budget_hours = fields.budgetHours
  if (fields.hourlyRate !== undefined) updates.hourly_rate = fields.hourlyRate
  if (fields.color !== undefined) updates.color = fields.color
  if (fields.isActive !== undefined) updates.is_active = fields.isActive
  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) return dbErr(error)

  revalidatePath('/customers/[id]', 'page')
  return ok(data as Project)
}

// ── Archive ──────────────────────────────────────────

export async function archiveProject(raw: unknown): Promise<ActionResult<Project>> {
  const parsed = archiveProjectSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, organizationId } = await getAuthContext()

  const { data, error } = await supabase
    .from('projects')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', parsed.data.id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) return dbErr(error)

  revalidatePath('/customers/[id]', 'page')
  return ok(data as Project)
}
