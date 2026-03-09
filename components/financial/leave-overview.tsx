'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { LeaveEntry, LeaveType } from '@/lib/mock/types'

const LEAVE_COLORS: Record<LeaveType, string> = {
  VACATION: '#3B82F6',
  SICK: '#EF4444',
  MATERNITY: '#EC4899',
  PUBLIC_HOLIDAY: '#F59E0B',
  OTHER: '#6B7280',
}

const LEAVE_TYPE_KEYS: Record<LeaveType, string> = {
  VACATION: 'vacation',
  SICK: 'sick',
  MATERNITY: 'maternity',
  PUBLIC_HOLIDAY: 'publicHoliday',
  OTHER: 'other',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7) // "YYYY-MM"
}

function formatMonthGroup(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
}

function getWorkdaysInYear(year: number): number {
  let count = 0
  const date = new Date(year, 0, 1)
  while (date.getFullYear() === year) {
    const day = date.getDay()
    if (day !== 0 && day !== 6) count++
    date.setDate(date.getDate() + 1)
  }
  return count
}

interface LeaveOverviewProps {
  entries: LeaveEntry[]
  year: number
}

export function LeaveOverview({ entries, year }: LeaveOverviewProps) {
  const t = useTranslations('financial.leave')

  const stats = useMemo(() => {
    const yearEntries = entries.filter(
      (e) => e.date.startsWith(year.toString()),
    )
    const totalWorkdays = getWorkdaysInYear(year)
    const offDays = yearEntries.filter(
      (e) => e.type !== 'SICK',
    ).length
    const sickDays = yearEntries.filter(
      (e) => e.type === 'SICK',
    ).length

    return { totalWorkdays, offDays, sickDays }
  }, [entries, year])

  const groupedEntries = useMemo(() => {
    const yearEntries = entries
      .filter((e) => e.date.startsWith(year.toString()))
      .sort((a, b) => a.date.localeCompare(b.date))

    const groups: Record<string, LeaveEntry[]> = {}
    for (const entry of yearEntries) {
      const key = getMonthKey(entry.date)
      if (!groups[key]) groups[key] = []
      groups[key].push(entry)
    }

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [entries, year])

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              {t('overview.workdays')}
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums">
              {stats.totalWorkdays}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              {t('overview.offDays')}
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
              {stats.offDays}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              {t('overview.sickDays')}
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
              {stats.sickDays}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Year label */}
      <h3 className="text-lg font-semibold">
        {t('year', { year })}
      </h3>

      {/* Grouped entries */}
      {groupedEntries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-base font-medium">{t('empty.title')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('empty.description')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedEntries.map(([monthKey, monthEntries]) => (
            <Card key={monthKey}>
              <CardHeader>
                <CardTitle className="text-sm capitalize">
                  {formatMonthGroup(monthKey)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {monthEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50"
                    >
                      <span className="w-24 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                        {formatDate(entry.date)}
                      </span>
                      <Badge
                        variant="outline"
                        className="shrink-0"
                        style={{
                          borderColor: LEAVE_COLORS[entry.type],
                          color: LEAVE_COLORS[entry.type],
                        }}
                      >
                        <span
                          className="mr-1 inline-block size-2 rounded-full"
                          style={{ backgroundColor: LEAVE_COLORS[entry.type] }}
                        />
                        {t(`types.${LEAVE_TYPE_KEYS[entry.type]}`)}
                      </Badge>
                      {entry.notes && (
                        <span className="truncate text-sm text-muted-foreground">
                          {entry.notes}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export function LeaveOverviewSkeleton() {
  return (
    <div className="space-y-4">
      {/* KPI skeletons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Entry skeletons */}
      <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      <Card>
        <CardHeader>
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
