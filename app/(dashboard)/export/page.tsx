import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeading } from '@/components/layout/page-heading'
import { ExportPageClient } from './export-page-client'

export default async function ExportPage() {
  const t = await getTranslations('pages')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const organizationId = profile?.organization_id

  // Fetch export-ready time entries (not yet exported)
  const { data: timeEntries } = organizationId
    ? await supabase
        .from('time_entries')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_export_ready', true)
        .is('exported_at', null)
        .order('started_at', { ascending: false })
    : { data: null }

  // Fetch export-ready expenses (not yet exported)
  const { data: expenses } = organizationId
    ? await supabase
        .from('expenses')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_export_ready', true)
        .is('exported_at', null)
        .order('date', { ascending: false })
    : { data: null }

  // Fetch clients for display names
  const { data: clients } = organizationId
    ? await supabase
        .from('clients')
        .select('id, name, is_active')
        .eq('organization_id', organizationId)
    : { data: null }

  // Fetch projects for display names
  const { data: projects } = organizationId
    ? await supabase
        .from('projects')
        .select('id, name, client_id')
        .eq('organization_id', organizationId)
    : { data: null }

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
