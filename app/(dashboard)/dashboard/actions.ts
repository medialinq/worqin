'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth'
import { ok, err, dbErr, type ActionResult } from '@/lib/action-utils'
import {
  createTaskSchema,
  updateTaskSchema,
  deleteTaskSchema,
} from '@/lib/validations'

type Task = {
  id: string
  organization_id: string
  user_id: string
  title: string
  due_at: string | null
  client_id: string | null
  project_id: string | null
  is_completed: boolean
  calendar_event_id: string | null
  created_at: string
}

export async function createTask(raw: unknown): Promise<ActionResult<Task>> {
  const parsed = createTaskSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId, organizationId } = await getAuthContext()

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      title: parsed.data.title,
      due_at: parsed.data.dueAt ?? null,
      client_id: parsed.data.clientId ?? null,
      project_id: parsed.data.projectId ?? null,
    })
    .select()
    .single()

  if (error) return dbErr(error)

  revalidatePath('/dashboard')
  return ok(data as Task)
}

export async function updateTask(raw: unknown): Promise<ActionResult<Task>> {
  const parsed = updateTaskSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId } = await getAuthContext()
  const { id, ...fields } = parsed.data

  const updates: Record<string, unknown> = {}
  if (fields.title !== undefined) updates.title = fields.title
  if (fields.dueAt !== undefined) updates.due_at = fields.dueAt
  if (fields.clientId !== undefined) updates.client_id = fields.clientId
  if (fields.projectId !== undefined) updates.project_id = fields.projectId
  if (fields.isCompleted !== undefined) updates.is_completed = fields.isCompleted

  if (Object.keys(updates).length === 0) return err('No fields to update')

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return dbErr(error)
  if (!data) return err('Task not found')

  revalidatePath('/dashboard')
  return ok(data as Task)
}

export async function toggleTaskComplete(raw: unknown): Promise<ActionResult<Task>> {
  const parsed = deleteTaskSchema.safeParse(raw) // same shape: { id }
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId } = await getAuthContext()
  const { id } = parsed.data

  // Fetch current state
  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('id, is_completed')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (fetchError || !task) return err('Task not found')

  const { data, error } = await supabase
    .from('tasks')
    .update({ is_completed: !task.is_completed })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return dbErr(error)

  revalidatePath('/dashboard')
  return ok(data as Task)
}

export async function deleteTask(raw: unknown): Promise<ActionResult<void>> {
  const parsed = deleteTaskSchema.safeParse(raw)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { supabase, userId } = await getAuthContext()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', parsed.data.id)
    .eq('user_id', userId)

  if (error) return dbErr(error)

  revalidatePath('/dashboard')
  return ok()
}
