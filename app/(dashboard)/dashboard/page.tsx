import { getTranslations } from 'next-intl/server'
import {
  mockUser,
  mockDashboardStats,
  mockCalendarEvents,
  mockClients,
  mockProjects,
  mockTimeEntries,
  mockCashflowForecast,
  mockTasks,
  mockActiveTimer,
} from '@/lib/mock'
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

  const firstName = mockUser.name.split(' ')[0]
  const greetingKey = getGreetingKey()

  // Count unconfirmed events for AI block
  const unconfirmedCount = mockCalendarEvents.filter((e) => {
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
          <KPICards stats={mockDashboardStats} />

          {/* AI Assistent */}
          <AIBlock unconfirmedCount={unconfirmedCount} />

          {/* Today column */}
          <TodayColumn
            events={mockCalendarEvents}
            tasks={mockTasks}
            clients={mockClients}
          />

          {/* Recent activity */}
          <RecentActivity
            entries={mockTimeEntries}
            clients={mockClients}
            projects={mockProjects}
          />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Active timer */}
          <ActiveTimer
            timer={mockActiveTimer}
            clients={mockClients}
            projects={mockProjects}
          />

          {/* Cashflow widget */}
          <CashflowWidget forecast={mockCashflowForecast} />
        </div>
      </div>
    </div>
  )
}
