'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TimeEntry, Client, Project } from '@/lib/mock/types'

const TYPE_DOT_COLORS: Record<string, string> = {
  BILLABLE: 'bg-billable',
  NON_BILLABLE: 'bg-non-billable',
  PRO_BONO: 'bg-pro-bono',
  INDIRECT_ADMIN: 'bg-indirect-admin',
  INDIRECT_SALES: 'bg-indirect-sales',
  INDIRECT_TRAVEL: 'bg-indirect-travel',
  INDIRECT_LEARNING: 'bg-indirect-learning',
  INDIRECT_OTHER: 'bg-indirect-other',
}

interface RecentActivityProps {
  entries: TimeEntry[]
  clients: Client[]
  projects: Project[]
}

function formatDuration(mins: number, units: { m: string; h: string }): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}${units.m}`
  if (m === 0) return `${h}${units.h}`
  return `${h}${units.h} ${m}${units.m}`
}

function formatTimeAgo(dateStr: string, units: { m: string; h: string; d: string }): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMins = Math.floor((now - then) / 60000)

  if (diffMins < 60) return `${diffMins}${units.m}`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}${units.h}`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}${units.d}`
}

export function RecentActivity({
  entries,
  clients,
  projects,
}: RecentActivityProps) {
  const t = useTranslations('dashboard.recentActivity')

  const durationUnits = { m: t('minuteShort'), h: t('hourShort') }
  const timeAgoUnits = { m: t('minuteShort'), h: t('hourShort'), d: t('dayShort') }

  // Take the 5 most recent completed entries
  const recent = entries
    .filter((e) => e.stoppedAt !== null)
    .sort(
      (a, b) =>
        new Date(b.stoppedAt!).getTime() - new Date(a.stoppedAt!).getTime()
    )
    .slice(0, 5)

  if (recent.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t('empty')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {recent.map((entry) => {
            const client = clients.find((c) => c.id === entry.clientId)
            const project = projects.find((p) => p.id === entry.projectId)

            return (
              <li
                key={entry.id}
                className="flex items-center gap-3 text-sm"
              >
                <span
                  className={`inline-block size-2.5 shrink-0 rounded-full ${
                    TYPE_DOT_COLORS[entry.type] ?? 'bg-muted-foreground'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {client && (
                      <span className="truncate font-medium">
                        {client.name}
                      </span>
                    )}
                    {project && (
                      <span className="truncate text-muted-foreground">
                        {client ? '·' : ''} {project.name}
                      </span>
                    )}
                    {!client && !project && entry.description && (
                      <span className="truncate text-muted-foreground">
                        {entry.description}
                      </span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                  {entry.durationMins ? formatDuration(entry.durationMins, durationUnits) : '—'}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {entry.stoppedAt ? formatTimeAgo(entry.stoppedAt, timeAgoUnits) : ''}
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
