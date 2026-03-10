import { getTranslations } from 'next-intl/server'
import { getAuthContext } from '@/lib/auth'
import { PageHeading } from '@/components/layout/page-heading'
import { CashflowPageClient } from './cashflow-page-client'

export default async function CashflowPage() {
  const t = await getTranslations('financial.cashflow')
  const { supabase, organizationId } = await getAuthContext()

  // Cashflow settings: 1-to-1 with organization
  const { data: settings } = await supabase
    .from('cashflow_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  return (
    <div className="space-y-4">
      <PageHeading title={t('title')} />
      <CashflowPageClient settings={settings ?? null} />
    </div>
  )
}
