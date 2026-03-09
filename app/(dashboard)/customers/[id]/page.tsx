import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  fetchClient,
  fetchProjectsByClient,
  fetchTimeEntriesByClient,
} from '@/lib/supabase/queries'
import { ClientDetailPage } from '@/components/clients/client-detail-page'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailRoute({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const client = await fetchClient(id)
  if (!client) notFound()

  const [projects, entries] = await Promise.all([
    fetchProjectsByClient(id),
    fetchTimeEntriesByClient(id),
  ])

  return (
    <ClientDetailPage
      client={client}
      projects={projects}
      entries={entries}
    />
  )
}
