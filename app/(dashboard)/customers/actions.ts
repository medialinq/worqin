'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth'
import { ok, err, dbErr, type ActionResult } from '@/lib/action-utils'
import {
  createClientSchema,
  updateClientSchema,
  archiveClientSchema,
} from '@/lib/validations'

// ── Types ────────────────────────────────────────────

type Client = {
  id: string
  organization_id: string
  name: string
  email: string | null
  color: string
  hourly_rate: number | null
  km_rate: number | null
  minimum_minutes: number | null
  is_active: boolean
  is_favorite: boolean
  jortt_id: string | null
  created_at: string
  updated_at: string
}

// ── Create ───────────────────────────────────────────

export async function createClient(raw: unknown): Promise<ActionResult<Client>> {
  const parsed = createClientSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, organizationId } = await getAuthContext()

  const { data, error } = await supabase
    .from('clients')
    .insert({
      organization_id: organizationId,
      name: parsed.data.name,
      email: parsed.data.email || null,
      color: parsed.data.color ?? '#3D52D5',
      hourly_rate: parsed.data.hourlyRate ?? null,
      km_rate: parsed.data.kmRate ?? null,
      minimum_minutes: parsed.data.minimumMinutes ?? null,
    })
    .select()
    .single()

  if (error) return dbErr(error)

  revalidatePath('/customers')
  return ok(data as Client)
}

// ── Update ───────────────────────────────────────────

export async function updateClient(raw: unknown): Promise<ActionResult<Client>> {
  const parsed = updateClientSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, organizationId } = await getAuthContext()
  const { id, ...fields } = parsed.data

  // Map camelCase input to snake_case DB columns
  const updates: Record<string, unknown> = {}
  if (fields.name !== undefined) updates.name = fields.name
  if (fields.email !== undefined) updates.email = fields.email || null
  if (fields.color !== undefined) updates.color = fields.color
  if (fields.hourlyRate !== undefined) updates.hourly_rate = fields.hourlyRate
  if (fields.kmRate !== undefined) updates.km_rate = fields.kmRate
  if (fields.minimumMinutes !== undefined) updates.minimum_minutes = fields.minimumMinutes
  if (fields.isActive !== undefined) updates.is_active = fields.isActive
  if (fields.isFavorite !== undefined) updates.is_favorite = fields.isFavorite
  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) return dbErr(error)

  revalidatePath('/customers')
  return ok(data as Client)
}

// ── Archive ──────────────────────────────────────────

export async function archiveClient(raw: unknown): Promise<ActionResult<Client>> {
  const parsed = archiveClientSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, organizationId } = await getAuthContext()

  const { data, error } = await supabase
    .from('clients')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', parsed.data.id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) return dbErr(error)

  revalidatePath('/customers')
  return ok(data as Client)
}

// ── Restore ──────────────────────────────────────────

export async function restoreClient(raw: unknown): Promise<ActionResult<Client>> {
  const parsed = archiveClientSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, organizationId } = await getAuthContext()

  const { data, error } = await supabase
    .from('clients')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', parsed.data.id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) return dbErr(error)

  revalidatePath('/customers')
  return ok(data as Client)
}

// ── Toggle Favorite ──────────────────────────────────

export async function toggleFavorite(raw: unknown): Promise<ActionResult<Client>> {
  const parsed = archiveClientSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, organizationId } = await getAuthContext()

  // Fetch current favorite state
  const { data: current, error: fetchError } = await supabase
    .from('clients')
    .select('is_favorite')
    .eq('id', parsed.data.id)
    .eq('organization_id', organizationId)
    .single()

  if (fetchError) return dbErr(fetchError)
  if (!current) return err('Client not found')

  // Flip the flag
  const { data, error } = await supabase
    .from('clients')
    .update({
      is_favorite: !current.is_favorite,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) return dbErr(error)

  revalidatePath('/customers')
  return ok(data as Client)
}
