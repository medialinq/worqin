import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeading } from '@/components/layout/page-heading'
import { CashflowPageClient } from './cashflow-page-client'

export default async function CashflowPage() {
  const t = await getTranslations('financial.cashflow')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const organizationId = profile?.organization_id

  // Cashflow settings: 1-to-1 with organization
  const { data: settings } = organizationId
    ? await supabase
        .from('cashflow_settings')
        .select('*')
        .eq('organization_id', organizationId)
        .single()
    : { data: null }

  return (
    <div className="space-y-4">
      <PageHeading title={t('title')} />
      <CashflowPageClient settings={settings ?? null} />
    </div>
  )
}
