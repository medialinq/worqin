import { getTranslations } from 'next-intl/server'
import { getAuthContext } from '@/lib/auth'
import { PageHeading } from '@/components/layout/page-heading'
import { ExportPageClient } from './export-page-client'

export default async function ExportPage() {
  const t = await getTranslations('pages')
  const { supabase, organizationId } = await getAuthContext()

  // Fetch export-ready time entries (not yet exported)
  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_export_ready', true)
    .is('exported_at', null)
    .order('started_at', { ascending: false })

  // Fetch export-ready expenses (not yet exported)
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_export_ready', true)
    .is('exported_at', null)
    .order('date', { ascending: false })

  // Fetch clients for display names
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, is_active')
    .eq('organization_id', organizationId)

  // Fetch projects for display names
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, client_id')
    .eq('organization_id', organizationId)

  return (
    <div className="space-y-4">
      <PageHeading title={t('export')} />
      <ExportPageClient
        initialTimeEntries={timeEntries ?? []}
        initialExpenses={expenses ?? []}
        clients={clients ?? []}
        projects={projects ?? []}
      />
    </div>
  )
}
