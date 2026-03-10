import { getTranslations } from 'next-intl/server'
import { getAuthContext } from '@/lib/auth'
import { fetchExpenses } from '@/lib/supabase/queries'
import { PageHeading } from '@/components/layout/page-heading'
import { ExpensesPageClient } from './expenses-page-client'

export default async function ExpensesPage() {
  const t = await getTranslations('expenses')
  const { userId } = await getAuthContext()

  const expenses = await fetchExpenses(userId)

  return (
    <div className="space-y-4">
      <PageHeading title={t('title')} />
      <ExpensesPageClient expenses={expenses} />
    </div>
  )
}
