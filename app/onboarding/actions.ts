'use server'

import { createClient } from '@/lib/supabase/server'
import { ok, err, dbErr, type ActionResult } from '@/lib/action-utils'
import {
  welcomeDataSchema,
  firstClientSchema,
  startFirstTimerSchema,
} from '@/lib/validations'

export async function saveWelcomeData(data: {
  name: string
  company: string
}): Promise<ActionResult> {
  const parsed = welcomeDataSchema.safeParse(data)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return err('Not authenticated')

  // Update user name
  await supabase
    .from('users')
    .update({ name: parsed.data.name })
    .eq('id', user.id)

  // Update organization name
  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (profile) {
    await supabase
      .from('organizations')
      .update({ name: parsed.data.company })
      .eq('id', profile.organization_id)
  }

  return ok()
}

export async function createFirstClient(data: {
  clientName: string
  clientEmail?: string
  clientRate?: string
}): Promise<ActionResult<{ id: string; name: string }>> {
  const parsed = firstClientSchema.safeParse(data)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return err('Not authenticated')

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) return err('No profile found')

  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      organization_id: profile.organization_id,
      name: parsed.data.clientName,
      email: parsed.data.clientEmail || null,
      hourly_rate: parsed.data.clientRate ? parseFloat(parsed.data.clientRate) : null,
    })
    .select('id, name')
    .single()

  if (error) return dbErr(error)

  return ok(client!)
}

export async function completeOnboarding(): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return err('Not authenticated')

  const { error } = await supabase
    .from('users')
    .update({ onboarded_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return dbErr(error)

  return ok()
}

export async function startFirstTimer(clientId?: string): Promise<ActionResult> {
  const parsed = startFirstTimerSchema.safeParse({ clientId })
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return err('Not authenticated')

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) return err('No profile found')

  const { error } = await supabase.from('time_entries').insert({
    organization_id: profile.organization_id,
    user_id: user.id,
    client_id: parsed.data.clientId || null,
    started_at: new Date().toISOString(),
    type: 'BILLABLE',
  })

  if (error) return dbErr(error)

  // Also mark as onboarded
  await supabase
    .from('users')
    .update({ onboarded_at: new Date().toISOString() })
    .eq('id', user.id)

  return ok()
}
