import { getTranslations } from 'next-intl/server'
import { getAuthContext } from '@/lib/auth'
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
  const { userId, organizationId, profile } = await getAuthContext()

  const [timeEntries, activeTimer, timerTemplates, clients, projects, leaveEntries] =
    await Promise.all([
      fetchRecentTimeEntries(userId),
      fetchActiveTimer(userId),
      fetchTimerTemplates(userId),
      fetchClients(organizationId),
      fetchProjects(organizationId),
      fetchLeaveEntries(userId),
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
