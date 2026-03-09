import { notFound } from 'next/navigation'
import { ClientDetailPage } from '@/components/clients/client-detail-page'
import { mockClients, mockProjects, mockTimeEntries } from '@/lib/mock'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailRoute({ params }: PageProps) {
  const { id } = await params

  const client = mockClients.find((c) => c.id === id)
  if (!client) notFound()

  const projects = mockProjects.filter((p) => p.clientId === id)
  const entries = mockTimeEntries.filter((e) => e.clientId === id)

  return (
    <ClientDetailPage
      client={client}
      projects={projects}
      entries={entries}
    />
  )
}
