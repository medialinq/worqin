import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeading } from '@/components/layout/page-heading'
import { ComplianceSettings } from '@/components/settings/compliance-settings'

export default async function CompliancePage() {
  const t = await getTranslations('pages')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  const organizationId = profile.organization_id

  // Fetch time entries for compliance computation (last 365 days max)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 365)

  const { data: timeEntries } = organizationId
    ? await supabase
        .from('time_entries')
        .select('id, client_id, type, is_indirect, duration_mins, duration_billed_mins, started_at')
        .eq('organization_id', organizationId)
        .gte('started_at', cutoffDate.toISOString())
        .order('started_at', { ascending: false })
    : { data: null }

  // Fetch clients for names and colors
  const { data: clients } = organizationId
    ? await supabase
        .from('clients')
        .select('id, name, color, is_active')
        .eq('organization_id', organizationId)
    : { data: null }

  return (
    <div className="space-y-4">
      <PageHeading title={t('compliance')} />
      <ComplianceSettings
        timeEntries={timeEntries ?? []}
        clients={clients ?? []}
      />
    </div>
  )
}
