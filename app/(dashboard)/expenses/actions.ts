'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth'
import { ok, err, type ActionResult } from '@/lib/action-utils'
import {
  createExpenseSchema,
  updateExpenseSchema,
  deleteExpenseSchema,
} from '@/lib/validations'

// ── Types ────────────────────────────────────────────

type Expense = {
  id: string
  organization_id: string
  user_id: string
  client_id: string | null
  project_id: string | null
  type: 'RECEIPT' | 'MILEAGE' | 'OTHER'
  description: string
  amount: number
  vat_rate: number | null
  receipt_url: string | null
  date: string
  is_export_ready: boolean
  exported_at: string | null
  created_at: string
}

// ── Create ───────────────────────────────────────────

export async function createExpense(raw: unknown): Promise<ActionResult<Expense>> {
  const parsed = createExpenseSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId, organizationId } = await getAuthContext()

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      client_id: parsed.data.clientId ?? null,
      project_id: parsed.data.projectId ?? null,
      type: parsed.data.type,
      description: parsed.data.description,
      amount: parsed.data.amount,
      vat_rate: parsed.data.vatRate ?? null,
      date: parsed.data.date,
    })
    .select()
    .single()

  if (error) return err(error.message)

  revalidatePath('/expenses')
  return ok(data as Expense)
}

// ── Update ───────────────────────────────────────────

export async function updateExpense(raw: unknown): Promise<ActionResult<Expense>> {
  const parsed = updateExpenseSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId } = await getAuthContext()
  const { id, ...fields } = parsed.data

  // Verify ownership and not yet exported
  const { data: existing, error: fetchError } = await supabase
    .from('expenses')
    .select('user_id, exported_at')
    .eq('id', id)
    .single()

  if (fetchError) return err(fetchError.message)
  if (!existing) return err('Expense not found')
  if (existing.user_id !== userId) return err('Not authorized')
  if (existing.exported_at) return err('Cannot update an exported expense')

  // Map camelCase input to snake_case DB columns
  const updates: Record<string, unknown> = {}
  if (fields.clientId !== undefined) updates.client_id = fields.clientId
  if (fields.projectId !== undefined) updates.project_id = fields.projectId
  if (fields.type !== undefined) updates.type = fields.type
  if (fields.description !== undefined) updates.description = fields.description
  if (fields.amount !== undefined) updates.amount = fields.amount
  if (fields.vatRate !== undefined) updates.vat_rate = fields.vatRate
  if (fields.date !== undefined) updates.date = fields.date
  if (fields.isExportReady !== undefined) updates.is_export_ready = fields.isExportReady

  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)

  revalidatePath('/expenses')
  return ok(data as Expense)
}

// ── Delete ───────────────────────────────────────────

export async function deleteExpense(raw: unknown): Promise<ActionResult<void>> {
  const parsed = deleteExpenseSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId } = await getAuthContext()

  // Verify ownership and not yet exported
  const { data: existing, error: fetchError } = await supabase
    .from('expenses')
    .select('user_id, exported_at')
    .eq('id', parsed.data.id)
    .single()

  if (fetchError) return err(fetchError.message)
  if (!existing) return err('Expense not found')
  if (existing.user_id !== userId) return err('Not authorized')
  if (existing.exported_at) return err('Cannot delete an exported expense')

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', parsed.data.id)
    .eq('user_id', userId)

  if (error) return err(error.message)

  revalidatePath('/expenses')
  return ok()
}

// ── Toggle Export Ready ──────────────────────────────

export async function toggleExportReady(raw: unknown): Promise<ActionResult<Expense>> {
  const parsed = deleteExpenseSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId } = await getAuthContext()

  // Fetch current state
  const { data: current, error: fetchError } = await supabase
    .from('expenses')
    .select('is_export_ready, user_id')
    .eq('id', parsed.data.id)
    .single()

  if (fetchError) return err(fetchError.message)
  if (!current) return err('Expense not found')
  if (current.user_id !== userId) return err('Not authorized')

  // Flip the flag
  const { data, error } = await supabase
    .from('expenses')
    .update({ is_export_ready: !current.is_export_ready })
    .eq('id', parsed.data.id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)

  revalidatePath('/expenses')
  return ok(data as Expense)
}
