'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { format, isSameDay, parseISO } from 'date-fns'
import { Plus } from 'lucide-react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { TYPE_COLOR_MAP, typeNeedsLightText } from './type-selector'
import type { TimeEntry, LeaveEntry, Client, Project } from '@/lib/mock/types'

const START_HOUR = 6
const END_HOUR = 23
const TOTAL_HOURS = END_HOUR - START_HOUR
const HOUR_HEIGHT = 60 // px per hour

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

const LEAVE_COLORS: Record<string, string> = {
  VACATION: 'var(--color-vacation)',
  SICK: 'var(--color-sick)',
  MATERNITY: 'var(--color-maternity)',
  PUBLIC_HOLIDAY: 'var(--color-public-holiday)',
  OTHER: 'var(--color-leave-other)',
}

const LEAVE_TYPE_KEYS: Record<string, string> = {
  VACATION: 'vacation',
  SICK: 'sick',
  MATERNITY: 'maternity',
  PUBLIC_HOLIDAY: 'publicHoliday',
  OTHER: 'other',
}

interface DayViewProps {
  date: Date
  entries: TimeEntry[]
  activeTimer: TimeEntry | null
  leaveEntries: LeaveEntry[]
  clients: Client[]
  projects: Project[]
}

function minutesSinceStart(dateStr: string): number {
  const d = new Date(dateStr)
  return (d.getHours() - START_HOUR) * 60 + d.getMinutes()
}

function formatDuration(mins: number, hLabel: string, mLabel: string): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}${mLabel}`
  if (m === 0) return `${h}${hLabel}`
  return `${h}${hLabel} ${m}${mLabel}`
}

export function DayView({
  date,
  entries,
  activeTimer,
  leaveEntries,
  clients,
  projects,
}: DayViewProps) {
  const t = useTranslations('timer')
  const tTypes = useTranslations('timer.types')
  const tLeave = useTranslations('financial.leave')
  const tTaxContext = useTranslations('financial.leave.taxContext')

  const hLabel = t('hoursShort')
  const mLabel = t('minutesShort')

  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Filter entries for the given day
  const dayEntries = useMemo(() => {
    return entries.filter((e) => isSameDay(parseISO(e.startedAt), date))
  }, [entries, date])

  // Check if active timer is today
  const activeIsToday =
    activeTimer && isSameDay(parseISO(activeTimer.startedAt), date)

  // Leave for this day
  const dayStr = format(date, 'yyyy-MM-dd')
  const leaveToday = leaveEntries.find((l) => l.date === dayStr)

  // Current time position
  const isToday = isSameDay(now, date)
  const currentMinutes = isToday
    ? (now.getHours() - START_HOUR) * 60 + now.getMinutes()
    : null

  // Find gaps between entries
  const gaps = useMemo(() => {
    const sorted = [...dayEntries]
    if (activeIsToday && activeTimer) {
      sorted.push(activeTimer)
    }
    sorted.sort(
      (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    )

    const result: { startMin: number; endMin: number }[] = []
    for (let i = 0; i < sorted.length - 1; i++) {
      const end = sorted[i].stoppedAt
        ? minutesSinceStart(sorted[i].stoppedAt!)
        : minutesSinceStart(now.toISOString())
      const nextStart = minutesSinceStart(sorted[i + 1].startedAt)
      if (nextStart - end >= 15) {
        result.push({ startMin: end, endMin: nextStart })
      }
    }
    return result
  }, [dayEntries, activeIsToday, activeTimer, now])

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i)

  const totalHeight = TOTAL_HOURS * HOUR_HEIGHT

  // Empty state
  if (dayEntries.length === 0 && !activeIsToday && !leaveToday) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-muted-foreground">{t('noEntries')}</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="relative overflow-hidden rounded-lg border">
        {/* Leave overlay */}
        {leaveToday && (
          <Tooltip>
            <TooltipTrigger
              render={
                <div
                  className="absolute inset-0 z-10 opacity-15"
                  style={{ backgroundColor: LEAVE_COLORS[leaveToday.type] || LEAVE_COLORS.OTHER }}
                />
              }
            />
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">
                  {tLeave(`types.${LEAVE_TYPE_KEYS[leaveToday.type] ?? 'other'}`)}
                </p>
                {leaveToday.notes && (
                  <p className="text-xs opacity-80">{leaveToday.notes}</p>
                )}
                <p className="text-xs opacity-60">
                  {tTaxContext(LEAVE_TYPE_KEYS[leaveToday.type] ?? 'other')}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        <div className="relative" style={{ height: totalHeight }}>
          {/* Hour grid lines + labels */}
          {hours.map((hour) => {
            const top = (hour - START_HOUR) * HOUR_HEIGHT
            return (
              <div
                key={hour}
                className="absolute left-0 right-0 border-b border-border/50"
                style={{ top }}
              >
                <span className="absolute left-2 top-1 font-mono text-xs text-muted-foreground tabular-nums">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            )
          })}

          {/* Time entries */}
          {dayEntries.map((entry) => {
            const startMin = minutesSinceStart(entry.startedAt)
            const endMin = entry.stoppedAt
              ? minutesSinceStart(entry.stoppedAt)
              : minutesSinceStart(now.toISOString())
            const durationMins = endMin - startMin
            const top = (startMin / 60) * HOUR_HEIGHT
            const height = Math.max((durationMins / 60) * HOUR_HEIGHT, 20)
            const client = clients.find((c) => c.id === entry.clientId)
            const project = projects.find((p) => p.id === entry.projectId)
            const typeKey = TYPE_LABELS[entry.type] ?? 'other'
            const lightText = typeNeedsLightText(entry.type)

            return (
              <Tooltip key={entry.id}>
                <TooltipTrigger
                  render={
                    <div
                      className="absolute left-14 right-2 z-20 cursor-pointer rounded-md px-2 py-1 transition-all hover:ring-2 hover:ring-offset-2"
                      style={{
                        top,
                        height,
                        backgroundColor: TYPE_COLOR_MAP[entry.type],
                        color: lightText ? '#FFFFFF' : '#1C1C1A',
                      }}
                    />
                  }
                >
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <span className="truncate text-xs font-medium">
                      {client?.name}
                      {project && ` — ${project.name}`}
                    </span>
                    {height > 30 && entry.description && (
                      <span className="truncate text-xs opacity-80">
                        {entry.description}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">{tTypes(typeKey)}</p>
                    {client && <p className="text-xs">{client.name}</p>}
                    {project && (
                      <p className="text-xs opacity-80">{project.name}</p>
                    )}
                    <p className="font-mono text-xs tabular-nums">
                      {formatDuration(durationMins, hLabel, mLabel)}
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

          {/* Active timer block (growing) */}
          {activeIsToday && activeTimer && (
            (() => {
              const startMin = minutesSinceStart(activeTimer.startedAt)
              const endMin = (now.getHours() - START_HOUR) * 60 + now.getMinutes()
              const durationMins = endMin - startMin
              const top = (startMin / 60) * HOUR_HEIGHT
              const height = Math.max((durationMins / 60) * HOUR_HEIGHT, 20)
              const lightText = typeNeedsLightText(activeTimer.type)

              return (
                <div
                  className="absolute left-14 right-2 z-20 rounded-md px-2 py-1"
                  style={{
                    top,
                    height,
                    backgroundColor: TYPE_COLOR_MAP[activeTimer.type],
                    color: lightText ? '#FFFFFF' : '#1C1C1A',
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-current" />
                    </span>
                    <span className="truncate text-xs font-medium">
                      {clients.find((c) => c.id === activeTimer.clientId)?.name}
                    </span>
                  </div>
                </div>
              )
            })()
          )}

          {/* Gap suggestions */}
          {gaps.map((gap, i) => {
            const top = (gap.startMin / 60) * HOUR_HEIGHT
            const height = Math.max(
              ((gap.endMin - gap.startMin) / 60) * HOUR_HEIGHT,
              20
            )
            return (
              <div
                key={`gap-${i}`}
                className="absolute left-14 right-2 z-10 flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 transition-colors hover:border-muted-foreground/50 hover:bg-muted/30"
                style={{ top, height }}
              >
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Plus className="size-3" />
                  <span>{t('gap.fill')}</span>
                </div>
              </div>
            )
          })}

          {/* Current time line */}
          {isToday && currentMinutes !== null && currentMinutes >= 0 && (
            <div
              className="absolute left-0 right-0 z-30 flex items-center"
              style={{ top: (currentMinutes / 60) * HOUR_HEIGHT }}
            >
              <span className="size-2 rounded-full bg-red-500" />
              <div className="h-0.5 flex-1 bg-red-500" />
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
