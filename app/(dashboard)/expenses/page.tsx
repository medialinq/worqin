import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { fetchExpenses } from '@/lib/supabase/queries'
import { PageHeading } from '@/components/layout/page-heading'
import { ExpensesPageClient } from './expenses-page-client'

export default async function ExpensesPage() {
  const t = await getTranslations('expenses')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const expenses = await fetchExpenses(user.id)

  return (
    <div className="space-y-4">
      <PageHeading title={t('title')} />
      <ExpensesPageClient expenses={expenses} />
    </div>
  )
}
