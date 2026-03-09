import { getTranslations } from 'next-intl/server'
import { PageHeading } from '@/components/layout/page-heading'
import { ExpensesPageClient } from './expenses-page-client'

export default async function ExpensesPage() {
  const t = await getTranslations('expenses')
  return (
    <div className="space-y-4">
      <PageHeading title={t('title')} />
      <ExpensesPageClient />
    </div>
  )
}
