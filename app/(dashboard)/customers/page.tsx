import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { fetchClients, fetchProjects } from '@/lib/supabase/queries'
import { PageHeading } from '@/components/layout/page-heading'
import { ClientList } from '@/components/clients/client-list'

export default async function ClientsPage() {
  const t = await getTranslations('clients')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const [clients, projects] = await Promise.all([
    fetchClients(profile.organization_id),
    fetchProjects(profile.organization_id),
  ])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeading title={t('title')} />
      </div>
      <ClientList clients={clients} projects={projects} />
    </div>
  )
}
