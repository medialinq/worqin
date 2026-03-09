import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import {
  fetchRecentTimeEntries,
  fetchActiveTimer,
  fetchTimerTemplates,
  fetchClients,
  fetchProjects,
  fetchLeaveEntries,
} from '@/lib/supabase/queries'
import { PageHeading } from '@/components/layout/page-heading'
import { TimelinePageClient } from '@/components/timeline/timeline-page-client'

export default async function TimelinePage() {
  const t = await getTranslations('pages')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id, weekly_hour_goal')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const [timeEntries, activeTimer, timerTemplates, clients, projects, leaveEntries] =
    await Promise.all([
      fetchRecentTimeEntries(user.id),
      fetchActiveTimer(user.id),
      fetchTimerTemplates(user.id),
      fetchClients(profile.organization_id),
      fetchProjects(profile.organization_id),
      fetchLeaveEntries(user.id),
    ])

  return (
    <div className="space-y-4">
      <PageHeading title={t('timeline')} />
      <TimelinePageClient
        timeEntries={timeEntries}
        activeTimer={activeTimer}
        timerTemplates={timerTemplates}
        clients={clients}
        projects={projects}
        leaveEntries={leaveEntries}
        weeklyHourGoal={profile.weekly_hour_goal ?? 40}
      />
    </div>
  )
}
