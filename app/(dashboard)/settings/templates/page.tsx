import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeading } from '@/components/layout/page-heading'
import { TemplatesSettings } from '@/components/settings/templates-settings'

export default async function TemplatesPage() {
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

  // Timer templates are per-user
  const { data: templates } = await supabase
    .from('timer_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch clients for dropdown
  const { data: clients } = organizationId
    ? await supabase
        .from('clients')
        .select('id, name')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('name')
    : { data: null }

  // Fetch projects for dropdown
  const { data: projects } = organizationId
    ? await supabase
        .from('projects')
        .select('id, name, client_id')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('name')
    : { data: null }

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
