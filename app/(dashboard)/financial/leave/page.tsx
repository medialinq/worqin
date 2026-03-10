import { getTranslations } from 'next-intl/server'
import { getAuthContext } from '@/lib/auth'
import { PageHeading } from '@/components/layout/page-heading'
import { LeavePageClient } from './leave-page-client'

export default async function LeavePage() {
  const t = await getTranslations('financial.leave')
  const { supabase, userId } = await getAuthContext()

  const { data: leaveEntries } = await supabase
    .from('leave_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  return (
    <div className="space-y-4">
      <PageHeading title={t('title')} />
      <LeavePageClient entries={leaveEntries ?? []} />
    </div>
  )
}
