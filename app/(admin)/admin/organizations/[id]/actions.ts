'use server'

import { createAdminSupabaseClient } from '@/lib/admin/supabase'
import { revalidatePath } from 'next/cache'

const VALID_PLANS = ['TRIAL', 'STARTER', 'PRO', 'TEAM'] as const
type Plan = typeof VALID_PLANS[number]

export async function changeOrganizationPlan(orgId: string, plan: Plan): Promise<{ error?: string }> {
  if (!orgId || !VALID_PLANS.includes(plan)) {
    return { error: 'Ongeldige invoer' }
  }

  const supabase = createAdminSupabaseClient()

  const { error } = await supabase
    .from('organizations')
    .update({ plan })
    .eq('id', orgId)

  if (error) {
    return { error: 'Plan bijwerken mislukt' }
  }

  revalidatePath(`/admin/organizations/${orgId}`)
  revalidatePath('/admin/organizations')
  revalidatePath('/admin/dashboard')

  return {}
}
