import { getTranslations } from 'next-intl/server'
import { PageHeading } from '@/components/layout/page-heading'
import { TimelinePageClient } from '@/components/timeline/timeline-page-client'

export default async function TimelinePage() {
  const t = await getTranslations('pages')

  return (
    <div className="space-y-4">
      <PageHeading title={t('timeline')} />
      <TimelinePageClient />
    </div>
  )
}
