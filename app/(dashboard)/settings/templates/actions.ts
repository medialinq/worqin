'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth'
import { ok, err, dbErr, type ActionResult } from '@/lib/action-utils'
import { createTemplateSchema, updateTemplateSchema } from '@/lib/validations'
import { z } from 'zod'

const deleteSchema = z.object({ id: z.string().uuid() })

export async function createTemplate(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = createTemplateSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId, organizationId } = await getAuthContext()

  const { data, error } = await supabase
    .from('timer_templates')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      name: parsed.data.name,
      client_id: parsed.data.clientId ?? null,
      project_id: parsed.data.projectId ?? null,
      type: parsed.data.type,
      description: parsed.data.description ?? null,
    })
    .select('id')
    .single()

  if (error) return dbErr(error)
  revalidatePath('/settings/templates')
  return ok({ id: data.id })
}

export async function updateTemplate(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = updateTemplateSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId } = await getAuthContext()
  const { id, ...fields } = parsed.data

  const updates: Record<string, unknown> = {}
  if (fields.name !== undefined) updates.name = fields.name
  if (fields.clientId !== undefined) updates.client_id = fields.clientId
  if (fields.projectId !== undefined) updates.project_id = fields.projectId
  if (fields.type !== undefined) updates.type = fields.type
  if (fields.description !== undefined) updates.description = fields.description

  const { data, error } = await supabase
    .from('timer_templates')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')
    .single()

  if (error) return dbErr(error)
  if (!data) return err('Template not found')
  revalidatePath('/settings/templates')
  return ok({ id: data.id })
}

export async function deleteTemplate(id: string): Promise<ActionResult> {
  const parsed = deleteSchema.safeParse({ id })
  if (!parsed.success) return err('Invalid ID')

  const { supabase, userId } = await getAuthContext()

  const { error } = await supabase
    .from('timer_templates')
    .delete()
    .eq('id', parsed.data.id)
    .eq('user_id', userId)

  if (error) return dbErr(error)
  revalidatePath('/settings/templates')
  return ok()
}

export async function toggleTemplateFavorite(id: string): Promise<ActionResult> {
  const parsed = deleteSchema.safeParse({ id })
  if (!parsed.success) return err('Invalid ID')

  const { supabase, userId } = await getAuthContext()

  const { data: tmpl, error: fetchErr } = await supabase
    .from('timer_templates')
    .select('is_favorite')
    .eq('id', parsed.data.id)
    .eq('user_id', userId)
    .single()

  if (fetchErr || !tmpl) return err('Template not found')

  const { error } = await supabase
    .from('timer_templates')
    .update({ is_favorite: !tmpl.is_favorite })
    .eq('id', parsed.data.id)
    .eq('user_id', userId)

  if (error) return dbErr(error)
  revalidatePath('/settings/templates')
  return ok()
}
