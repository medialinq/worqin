import { getTranslations } from 'next-intl/server'
import { PageHeading } from '@/components/layout/page-heading'
import { LeavePageClient } from './leave-page-client'

export default async function LeavePage() {
  const t = await getTranslations('financial.leave')
  return (
    <div className="space-y-4">
      <PageHeading title={t('title')} />
      <LeavePageClient />
    </div>
  )
}
