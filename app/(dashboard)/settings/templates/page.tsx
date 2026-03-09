import { getTranslations } from 'next-intl/server'
import { PageHeading } from '@/components/layout/page-heading'
import { TemplatesSettings } from '@/components/settings/templates-settings'

export default async function TemplatesPage() {
  const t = await getTranslations('pages')
  return (
    <div className="space-y-4">
      <PageHeading title={t('templates')} />
      <TemplatesSettings />
    </div>
  )
}
