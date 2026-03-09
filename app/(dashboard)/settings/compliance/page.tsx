import { getTranslations } from 'next-intl/server'
import { PageHeading } from '@/components/layout/page-heading'
import { ComplianceSettings } from '@/components/settings/compliance-settings'

export default async function CompliancePage() {
  const t = await getTranslations('pages')
  return (
    <div className="space-y-4">
      <PageHeading title={t('compliance')} />
      <ComplianceSettings />
    </div>
  )
}
