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
import {
  mockTimeEntries,
  mockActiveTimer,
  mockTimerTemplates,
  mockClients,
  mockProjects,
  mockLeaveEntries,
  mockUser,
} from '@/lib/mock'

export function TimelinePageClient() {
  const t = useTranslations('timer')

  const [currentDate] = useState(() => new Date())

  return (
    <div className="space-y-4">
      {/* Budget alerts */}
      <BudgetAlert
        entries={mockTimeEntries}
        projects={mockProjects}
        clients={mockClients}
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
                clients={mockClients}
                projects={mockProjects}
              />
            </div>

            <TabsContent value="day">
              <DayView
                date={currentDate}
                entries={mockTimeEntries}
                activeTimer={mockActiveTimer}
                leaveEntries={mockLeaveEntries}
                clients={mockClients}
                projects={mockProjects}
              />
            </TabsContent>

            <TabsContent value="week">
              <WeekView
                currentDate={currentDate}
                entries={mockTimeEntries}
                activeTimer={mockActiveTimer}
                leaveEntries={mockLeaveEntries}
                weeklyGoal={mockUser.weeklyHourGoal}
                clients={mockClients}
                projects={mockProjects}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Timer panel + templates */}
        <div className="order-first space-y-4 lg:order-last">
          <TimerPanel
            activeTimer={mockActiveTimer}
            clients={mockClients}
            projects={mockProjects}
          />
          <TimerTemplates
            templates={mockTimerTemplates}
            clients={mockClients}
          />
        </div>
      </div>
    </div>
  )
}
