import { getTranslations } from 'next-intl/server'
import { getAuthContext } from '@/lib/auth'
import { PageHeading } from '@/components/layout/page-heading'
import { ComplianceSettings } from '@/components/settings/compliance-settings'

export default async function CompliancePage() {
  const t = await getTranslations('pages')
  const { supabase, organizationId } = await getAuthContext()

  // Fetch time entries for compliance computation (last 365 days max)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 365)

  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select('id, client_id, type, is_indirect, duration_mins, duration_billed_mins, started_at')
    .eq('organization_id', organizationId)
    .gte('started_at', cutoffDate.toISOString())
    .order('started_at', { ascending: false })

  // Fetch clients for names and colors
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, color, is_active')
    .eq('organization_id', organizationId)

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
