import { getTranslations } from 'next-intl/server'
import { getAuthContext } from '@/lib/auth'
import { PageHeading } from '@/components/layout/page-heading'
import { TemplatesSettings } from '@/components/settings/templates-settings'

export default async function TemplatesPage() {
  const t = await getTranslations('pages')
  const { supabase, userId, organizationId } = await getAuthContext()

  // Timer templates are per-user
  const { data: templates } = await supabase
    .from('timer_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Fetch clients for dropdown
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('name')

  // Fetch projects for dropdown
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, client_id')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('name')

  return (
    <div className="space-y-4">
      <PageHeading title={t('templates')} />
      <TemplatesSettings
        initialTemplates={templates ?? []}
        clients={clients ?? []}
        projects={projects ?? []}
      />
    </div>
  )
}
