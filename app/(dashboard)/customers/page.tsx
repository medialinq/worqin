import { getTranslations } from 'next-intl/server'
import { PageHeading } from '@/components/layout/page-heading'
import { ClientList } from '@/components/clients/client-list'
import { mockClients, mockProjects } from '@/lib/mock'

export default async function ClientsPage() {
  const t = await getTranslations('clients')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeading title={t('title')} />
      </div>
      <ClientList clients={mockClients} projects={mockProjects} />
    </div>
  )
}
