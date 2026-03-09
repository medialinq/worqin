import { getTranslations } from 'next-intl/server'
import { PageHeading } from '@/components/layout/page-heading'
import { CashflowPageClient } from './cashflow-page-client'

export default async function CashflowPage() {
  const t = await getTranslations('financial.cashflow')
  return (
    <div className="space-y-4">
      <PageHeading title={t('title')} />
      <CashflowPageClient />
    </div>
  )
}
