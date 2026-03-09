'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
  format,
  differenceInMinutes,
  isToday as isDateToday,
  getHours,
  getMinutes,
} from 'date-fns'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { TYPE_COLOR_MAP, typeNeedsLightText } from './type-selector'
import type { TimeEntry, LeaveEntry, Client, Project } from '@/lib/mock/types'

const START_HOUR = 7
const END_HOUR = 20
const TOTAL_HOURS = END_HOUR - START_HOUR
const SLOT_HEIGHT = 48 // px per hour

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

const LEAVE_COLORS: Record<string, string> = {
  VACATION: 'var(--color-vacation)',
  SICK: 'var(--color-sick)',
  MATERNITY: 'var(--color-maternity)',
  PUBLIC_HOLIDAY: 'var(--color-public-holiday)',
  OTHER: 'var(--color-leave-other)',
}

const TYPE_LABELS: Record<string, string> = {
  BILLABLE: 'billable',
  NON_BILLABLE: 'nonBillable',
  PRO_BONO: 'proBono',
  INDIRECT_ADMIN: 'admin',
  INDIRECT_SALES: 'sales',
  INDIRECT_TRAVEL: 'travel',
  INDIRECT_LEARNING: 'learning',
  INDIRECT_OTHER: 'other',
}

interface WeekViewProps {
  currentDate: Date
  entries: TimeEntry[]
  activeTimer: TimeEntry | null
  leaveEntries: LeaveEntry[]
  weeklyGoal: number
  clients?: Client[]
  projects?: Project[]
}

function entryDurationMins(entry: TimeEntry, now: Date): number {
  if (entry.durationMins != null) return entry.durationMins
  const end = entry.stoppedAt ? new Date(entry.stoppedAt) : now
  return differenceInMinutes(end, new Date(entry.startedAt))
}

export function WeekView({
  currentDate,
  entries,
  activeTimer,
  leaveEntries,
  weeklyGoal,
  clients = [],
  projects = [],
}: WeekViewProps) {
  const t = useTranslations('timer')
  const tTypes = useTranslations('timer.types')
  const tDays = useTranslations('timer.dayLabels')

  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  )

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  // Group entries per day
  const getEntriesForDay = (day: Date) => {
    const dayEntries = entries.filter((e) =>
      isSameDay(parseISO(e.startedAt), day)
    )
    if (activeTimer && isSameDay(parseISO(activeTimer.startedAt), day)) {
      return [...dayEntries, activeTimer]
    }
    return dayEntries
  }

  // Calculate position for an entry
  const getEntryStyle = (entry: TimeEntry) => {
    const start = new Date(entry.startedAt)
    const end = entry.stoppedAt ? new Date(entry.stoppedAt) : now
    const startHour = getHours(start) + getMinutes(start) / 60
    const durationMins = differenceInMinutes(end, start)
    const durationHours = durationMins / 60

    const top = Math.max(0, (startHour - START_HOUR) * SLOT_HEIGHT)
    const height = Math.max(SLOT_HEIGHT / 3, durationHours * SLOT_HEIGHT)

    return { top, height }
  }

  // Week totals
  const weekTotalMins = useMemo(() => {
    return weekDays.reduce((sum, day) => {
      const dayEntries = getEntriesForDay(day)
      return sum + dayEntries.reduce((s, e) => s + entryDurationMins(e, now), 0)
    }, 0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekDays, entries, activeTimer, now])

  const weekTotalHours = Math.round((weekTotalMins / 60) * 10) / 10
  const goalProgress = Math.min((weekTotalHours / weeklyGoal) * 100, 100)

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Time grid */}
        <div className="overflow-x-auto overflow-y-hidden rounded-lg border bg-card">
          <div className="min-w-[500px]">
            {/* Day header row */}
            <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b">
              <div className="p-1.5" />
              {weekDays.map((day, i) => {
                const dayStr = format(day, 'yyyy-MM-dd')
                const leave = leaveEntries.find((l) => l.date === dayStr)
                const today = isDateToday(day)

                return (
                  <div
                    key={i}
                    className={cn(
                      'relative border-l p-1.5 text-center',
                      today && 'bg-primary/5'
                    )}
                  >
                    {leave && (
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundColor:
                            LEAVE_COLORS[leave.type] || LEAVE_COLORS.OTHER,
                        }}
                      />
                    )}
                    <span className="relative text-[11px] font-medium uppercase text-muted-foreground">
                      {tDays(DAY_KEYS[i])}
                    </span>
                    <div
                      className={cn(
                        'relative mx-auto mt-0.5 flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                        today && 'bg-primary text-primary-foreground'
                      )}
                    >
                      {format(day, 'd')}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Time grid body */}
            <div className="relative grid grid-cols-[48px_repeat(7,1fr)]">
              {/* Time labels */}
              <div className="relative">
                {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="border-t pr-1 text-right"
                    style={{ height: i < TOTAL_HOURS ? SLOT_HEIGHT : 0 }}
                  >
                    <span className="inline-block -translate-y-1/2 font-mono text-[10px] text-muted-foreground">
                      {String(START_HOUR + i).padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day, dayIndex) => {
                const dayEntries = getEntriesForDay(day)
                const today = isDateToday(day)
                const dayStr = format(day, 'yyyy-MM-dd')
                const leave = leaveEntries.find((l) => l.date === dayStr)

                // Current time indicator
                const currentMinutes =
                  today
                    ? (now.getHours() - START_HOUR) * 60 + now.getMinutes()
                    : null

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      'relative border-l',
                      today && 'bg-primary/5'
                    )}
                  >
                    {/* Leave overlay */}
                    {leave && (
                      <div
                        className="absolute inset-0 z-0 opacity-8"
                        style={{
                          backgroundColor:
                            LEAVE_COLORS[leave.type] || LEAVE_COLORS.OTHER,
                        }}
                      />
                    )}

                    {/* Hour grid lines */}
                    {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
                      <div
                        key={i}
                        className="border-t"
                        style={{ height: i < TOTAL_HOURS ? SLOT_HEIGHT : 0 }}
                      />
                    ))}

                    {/* Time entries overlay */}
                    <div className="absolute inset-0 z-10">
                      {dayEntries.map((entry) => {
                        const style = getEntryStyle(entry)
                        const isActive = !entry.stoppedAt
                        const client = clients.find(
                          (c) => c.id === entry.clientId
                        )
                        const project = projects.find(
                          (p) => p.id === entry.projectId
                        )
                        const typeKey = TYPE_LABELS[entry.type] ?? 'other'
                        const lightText = typeNeedsLightText(entry.type)
                        const mins = entryDurationMins(entry, now)

                        return (
                          <Tooltip key={entry.id}>
                            <TooltipTrigger
                              render={
                                <div
                                  className="absolute left-0.5 right-0.5 cursor-default rounded-sm px-1 py-0.5 transition-opacity hover:opacity-90"
                                  style={{
                                    top: style.top,
                                    height: style.height,
                                    backgroundColor:
                                      TYPE_COLOR_MAP[entry.type],
                                    color: lightText ? '#FFFFFF' : '#1C1C1A',
                                  }}
                                />
                              }
                            >
                              <div className="flex items-center gap-1 overflow-hidden">
                                {isActive && (
                                  <span className="relative flex size-1.5 shrink-0">
                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75" />
                                    <span className="relative inline-flex size-1.5 rounded-full bg-current" />
                                  </span>
                                )}
                                {style.height > 20 && (
                                  <span className="truncate text-[10px] font-medium leading-tight">
                                    {client?.name}
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <p className="font-medium">
                                  {tTypes(typeKey)}
                                </p>
                                {client && (
                                  <p className="text-xs">{client.name}</p>
                                )}
                                {project && (
                                  <p className="text-xs opacity-80">
                                    {project.name}
                                  </p>
                                )}
                                <p className="font-mono text-xs tabular-nums">
                                  {Math.floor(mins / 60)}
                                  {t('hoursShort')} {mins % 60}
                                  {t('minutesShort')}
                                </p>
                                {entry.description && (
                                  <p className="max-w-48 text-xs opacity-60">
                                    {entry.description}
                                  </p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>

                    {/* Current time line */}
                    {currentMinutes !== null && currentMinutes >= 0 && (
                      <div
                        className="absolute left-0 right-0 z-20 flex items-center"
                        style={{
                          top: (currentMinutes / 60) * SLOT_HEIGHT,
                        }}
                      >
                        <span className="size-1.5 rounded-full bg-red-500" />
                        <div className="h-px flex-1 bg-red-500" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Week total + goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('weekTotal')}</span>
            <span className="font-mono font-medium tabular-nums">
              {weekTotalHours}/{weeklyGoal}
              {t('hoursShort')}
            </span>
          </div>
          <Progress value={goalProgress} />
        </div>
      </div>
    </TooltipProvider>
  )
}
