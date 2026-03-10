import { getTranslations } from 'next-intl/server'
import { getAuthContext } from '@/lib/auth'
import { fetchExpenses, fetchClients } from '@/lib/supabase/queries'
import { PageHeading } from '@/components/layout/page-heading'
import { ExpensesPageClient } from './expenses-page-client'

export default async function ExpensesPage() {
  const t = await getTranslations('expenses')
  const { userId, organizationId } = await getAuthContext()

  const [expenses, clients] = await Promise.all([
    fetchExpenses(userId),
    fetchClients(organizationId),
  ])

  return (
    <div className="space-y-4">
      <PageHeading title={t('title')} />
      <ExpensesPageClient expenses={expenses} clients={clients} />
    </div>
  )
}
