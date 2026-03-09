'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveWelcomeData(data: { name: string; company: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Update user name
  await supabase
    .from('users')
    .update({ name: data.name })
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
      .update({ name: data.company })
      .eq('id', profile.organization_id)
  }

  return { success: true }
}

export async function createFirstClient(data: {
  clientName: string
  clientEmail?: string
  clientRate?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'No profile found' }

  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      organization_id: profile.organization_id,
      name: data.clientName,
      email: data.clientEmail || null,
      hourly_rate: data.clientRate ? parseFloat(data.clientRate) : null,
    })
    .select('id, name')
    .single()

  if (error) return { error: error.message }

  return { success: true, client }
}

export async function completeOnboarding() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('users')
    .update({ onboarded_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }

  return { success: true }
}

export async function startFirstTimer(clientId?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'No profile found' }

  const { error } = await supabase.from('time_entries').insert({
    organization_id: profile.organization_id,
    user_id: user.id,
    client_id: clientId || null,
    started_at: new Date().toISOString(),
    type: 'BILLABLE',
  })

  if (error) return { error: error.message }

  // Also mark as onboarded
  await supabase
    .from('users')
    .update({ onboarded_at: new Date().toISOString() })
    .eq('id', user.id)

  return { success: true }
}
