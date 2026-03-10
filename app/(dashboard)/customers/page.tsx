import { getTranslations } from 'next-intl/server'
import { getAuthContext } from '@/lib/auth'
import { fetchClients, fetchProjects } from '@/lib/supabase/queries'
import { PageHeading } from '@/components/layout/page-heading'
import { ClientList } from '@/components/clients/client-list'

export default async function ClientsPage() {
  const t = await getTranslations('clients')
  const { organizationId } = await getAuthContext()

  const [clients, projects] = await Promise.all([
    fetchClients(organizationId),
    fetchProjects(organizationId),
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
