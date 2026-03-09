import { getTranslations } from 'next-intl/server'
import { PageHeading } from '@/components/layout/page-heading'
import { AgendaSettings } from '@/components/settings/agenda-settings'

export default async function AgendaSettingsPage() {
  const t = await getTranslations('pages')
  return (
    <div className="space-y-4">
      <PageHeading title={t('agendaSettings')} />
      <AgendaSettings />
    </div>
  )
}
