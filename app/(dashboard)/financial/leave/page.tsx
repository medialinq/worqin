import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeading } from '@/components/layout/page-heading'
import { LeavePageClient } from './leave-page-client'

export default async function LeavePage() {
  const t = await getTranslations('financial.leave')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: leaveEntries } = await supabase
    .from('leave_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  return (
    <div className="space-y-4">
      <PageHeading title={t('title')} />
      <LeavePageClient entries={leaveEntries ?? []} />
    </div>
  )
}
