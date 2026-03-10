import { getTranslations } from 'next-intl/server'
import { getAuthContext } from '@/lib/auth'
import { fetchCalendarConnections } from '@/lib/supabase/queries'
import { PageHeading } from '@/components/layout/page-heading'
import { AgendaSettings } from '@/components/settings/agenda-settings'

export default async function AgendaSettingsPage() {
  const t = await getTranslations('pages')
  const { userId } = await getAuthContext()

  const connections = await fetchCalendarConnections(userId)

  return (
    <div className="space-y-4">
      <PageHeading title={t('agendaSettings')} />
      <AgendaSettings connections={connections} />
    </div>
  )
}
