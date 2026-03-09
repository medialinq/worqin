import { getTranslations } from 'next-intl/server'
import { PageHeading } from '@/components/layout/page-heading'
import { SettingsOverview } from '@/components/settings/settings-overview'

export default async function SettingsPage() {
  const t = await getTranslations('settings')
  return (
    <div className="space-y-4">
      <PageHeading title={t('title')} />
      <SettingsOverview />
    </div>
  )
}
