import { getTranslations } from 'next-intl/server'
import { getAuthContext } from '@/lib/auth'
import {
  fetchClients,
  fetchProjects,
  fetchRecentTimeEntries,
  fetchCalendarEvents,
  fetchTasks,
  fetchDashboardStats,
  fetchCashflowForecast,
  fetchActiveTimer,
} from '@/lib/supabase/queries'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { ActiveTimer } from '@/components/dashboard/active-timer'
import { AIBlock } from '@/components/dashboard/ai-block'
import { TodayColumn } from '@/components/dashboard/today-column'
import { CashflowWidget } from '@/components/dashboard/cashflow-widget'
import { RecentActivity } from '@/components/dashboard/recent-activity'

function getGreetingKey(): 'greeting' | 'greetingAfternoon' | 'greetingEvening' {
  const hour = new Date().getHours()
  if (hour < 12) return 'greeting'
  if (hour < 18) return 'greetingAfternoon'
  return 'greetingEvening'
}

export default async function DashboardPage() {
  const t = await getTranslations('dashboard')
  const { supabase, user, userId, organizationId, profile } = await getAuthContext()

  // Fetch full profile with organization for dashboard-specific fields
  const { data: fullProfile } = await supabase
    .from('users')
    .select('*, organizations(*)')
    .eq('id', userId)
    .single()

  const weeklyHourGoal = profile.weekly_hour_goal ?? 40
  const firstName = (fullProfile?.name ?? user.email ?? '').split(' ')[0]
  const greetingKey = getGreetingKey()

  // Fetch all dashboard data in parallel
  const [
    stats,
    calendarEvents,
    clients,
    projects,
    timeEntries,
    cashflowForecast,
    tasks,
    activeTimer,
  ] = await Promise.all([
    fetchDashboardStats(user.id, weeklyHourGoal),
    fetchCalendarEvents(user.id),
    fetchClients(organizationId),
    fetchProjects(organizationId),
    fetchRecentTimeEntries(user.id),
    fetchCashflowForecast(organizationId),
    fetchTasks(user.id),
    fetchActiveTimer(user.id),
  ])

  // Count unconfirmed events for AI block
  const unconfirmedCount = calendarEvents.filter((e) => {
    const eventDate = new Date(e.startAt)
    const now = new Date()
    return (
      eventDate.getFullYear() === now.getFullYear() &&
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getDate() === now.getDate() &&
      e.confirmedAt === null
    )
  }).length

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <h1 className="text-2xl font-bold tracking-tight">
        {t(greetingKey, { name: firstName })}
      </h1>

      {/* Main grid: left content + right sidebar */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-4">
          {/* KPI cards */}
          <KPICards stats={stats} />

          {/* AI Assistent */}
          <AIBlock unconfirmedCount={unconfirmedCount} />

          {/* Today column */}
          <TodayColumn
            events={calendarEvents}
            tasks={tasks}
            clients={clients}
          />

          {/* Recent activity */}
          <RecentActivity
            entries={timeEntries}
            clients={clients}
            projects={projects}
          />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Active timer */}
          <ActiveTimer
            timer={activeTimer}
            clients={clients}
            projects={projects}
          />

          {/* Cashflow widget */}
          <CashflowWidget forecast={cashflowForecast} />
        </div>
      </div>
    </div>
  )
}
