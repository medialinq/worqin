'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Clock, DollarSign, FolderOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Client, Project, TimeEntry } from '@/lib/mock/types'

interface ClientOverviewProps {
  client: Client
  projects: Project[]
  entries: TimeEntry[]
}

export function ClientOverview({ client, projects, entries }: ClientOverviewProps) {
  const t = useTranslations('clients')

  const stats = useMemo(() => {
    const totalMins = entries.reduce(
      (sum, e) => sum + (e.durationMins ?? 0),
      0
    )
    const totalHours = totalMins / 60
    const totalRevenue = entries.reduce((sum, e) => {
      if (e.hourlyRateSnapshot != null && e.durationBilledMins != null) {
        return sum + (e.hourlyRateSnapshot * e.durationBilledMins) / 60
      }
      return sum
    }, 0)
    const activeProjectCount = projects.filter((p) => p.isActive).length
    return { totalHours, totalRevenue, activeProjectCount }
  }, [entries, projects])

  const recentEntries = useMemo(() => {
    return [...entries]
      .filter((e) => e.stoppedAt != null)
      .sort(
        (a, b) =>
          new Date(b.stoppedAt!).getTime() - new Date(a.stoppedAt!).getTime()
      )
      .slice(0, 5)
  }, [entries])

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('totalHours')}
            </CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono tabular-nums">
              {stats.totalHours.toFixed(1)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('totalRevenue')}
            </CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono tabular-nums">
              &euro;{stats.totalRevenue.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('activeProjects')}
            </CardTitle>
            <FolderOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono tabular-nums">
              {stats.activeProjectCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('clientInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {client.email && (
              <div>
                <dt className="text-muted-foreground">{t('fields.email')}</dt>
                <dd>{client.email}</dd>
              </div>
            )}
            {client.hourlyRate != null && (
              <div>
                <dt className="text-muted-foreground">{t('fields.hourlyRate')}</dt>
                <dd className="font-mono tabular-nums">
                  &euro;{client.hourlyRate}
                </dd>
              </div>
            )}
            {client.kmRate != null && (
              <div>
                <dt className="text-muted-foreground">{t('fields.kmRate')}</dt>
                <dd className="font-mono tabular-nums">
                  &euro;{client.kmRate}
                </dd>
              </div>
            )}
            {client.minimumMinutes != null && (
              <div>
                <dt className="text-muted-foreground">{t('fields.minimumMinutes')}</dt>
                <dd className="font-mono tabular-nums">
                  {client.minimumMinutes} min
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Recent entries */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recentEntries')}</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noEntries')}</p>
          ) : (
            <div className="space-y-0">
              {recentEntries.map((entry) => {
                const hours = (entry.durationMins ?? 0) / 60
                const date = entry.stoppedAt
                  ? new Date(entry.stoppedAt).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : ''
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between border-b border-border py-2 last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        {entry.description ?? '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">{date}</p>
                    </div>
                    <span className="ml-4 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                      {hours.toFixed(1)}u
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
