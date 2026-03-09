import { getTranslations } from 'next-intl/server'
import { PageHeading } from '@/components/layout/page-heading'
import { ExportPageClient } from './export-page-client'

export default async function ExportPage() {
  const t = await getTranslations('pages')
  return (
    <div className="space-y-4">
      <PageHeading title={t('export')} />
      <ExportPageClient />
    </div>
  )
}
