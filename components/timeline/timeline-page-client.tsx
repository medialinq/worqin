'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TimerPanel } from './timer-panel'
import { TimerTemplates } from './timer-templates'
import { DayView } from './day-view'
import { WeekView } from './week-view'
import { BackfillDialog } from './backfill-dialog'
import { BudgetAlert } from './budget-alert'
import type {
  TimeEntry,
  TimerTemplate as TimerTemplateType,
  Client,
  Project,
  LeaveEntry,
} from '@/lib/mock/types'

interface TimelinePageClientProps {
  timeEntries: TimeEntry[]
  activeTimer: TimeEntry | null
  timerTemplates: TimerTemplateType[]
  clients: Client[]
  projects: Project[]
  leaveEntries: LeaveEntry[]
  weeklyHourGoal: number
}

export function TimelinePageClient({
  timeEntries,
  activeTimer,
  timerTemplates,
  clients,
  projects,
  leaveEntries,
  weeklyHourGoal,
}: TimelinePageClientProps) {
  const t = useTranslations('timer')

  const [currentDate] = useState(() => new Date())

  return (
    <div className="space-y-4">
      {/* Budget alerts */}
      <BudgetAlert
        entries={timeEntries}
        projects={projects}
        clients={clients}
      />

      {/* Main layout: timeline + side panel */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Left: Day/Week view */}
        <div>
          <Tabs defaultValue="day">
            <div className="mb-4 flex items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="day">{t('day')}</TabsTrigger>
                <TabsTrigger value="week">{t('week')}</TabsTrigger>
              </TabsList>
              <BackfillDialog
                clients={clients}
                projects={projects}
              />
            </div>

            <TabsContent value="day">
              <DayView
                date={currentDate}
                entries={timeEntries}
                activeTimer={activeTimer}
                leaveEntries={leaveEntries}
                clients={clients}
                projects={projects}
              />
            </TabsContent>

            <TabsContent value="week">
              <WeekView
                currentDate={currentDate}
                entries={timeEntries}
                activeTimer={activeTimer}
                leaveEntries={leaveEntries}
                weeklyGoal={weeklyHourGoal}
                clients={clients}
                projects={projects}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Timer panel + templates */}
        <div className="order-first space-y-4 lg:order-last">
          <TimerPanel
            activeTimer={activeTimer}
            clients={clients}
            projects={projects}
          />
          <TimerTemplates
            templates={timerTemplates}
            clients={clients}
          />
        </div>
      </div>
    </div>
  )
}
