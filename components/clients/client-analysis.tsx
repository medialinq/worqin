'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Client, Project, TimeEntry } from '@/lib/mock/types'

interface ClientAnalysisProps {
  client: Client
  projects: Project[]
  entries: TimeEntry[]
}

const TYPE_COLORS: Record<string, string> = {
  BILLABLE: 'var(--color-billable)',
  NON_BILLABLE: 'var(--color-non-billable)',
  PRO_BONO: 'var(--color-pro-bono)',
}

export function ClientAnalysis({ client, projects, entries }: ClientAnalysisProps) {
  const t = useTranslations('clients')

  const analysis = useMemo(() => {
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
    const effectiveRate = totalHours > 0 ? totalRevenue / totalHours : 0
    const declaredRate = client.hourlyRate ?? 0

    // Breakdown by type
    const byType: Record<string, number> = {}
    for (const e of entries) {
      const type =
        e.type === 'BILLABLE'
          ? 'BILLABLE'
          : e.type === 'NON_BILLABLE'
          ? 'NON_BILLABLE'
          : e.type === 'PRO_BONO'
          ? 'PRO_BONO'
          : 'NON_BILLABLE'
      byType[type] = (byType[type] || 0) + (e.durationMins ?? 0) / 60
    }

    const typeLabels: Record<string, string> = {
      BILLABLE: t('analysis.billable'),
      NON_BILLABLE: t('analysis.nonBillable'),
      PRO_BONO: t('analysis.proBono'),
    }

    const breakdownData = Object.entries(byType).map(([type, hours]) => ({
      name: typeLabels[type] || type,
      value: Math.round(hours * 10) / 10,
      color: TYPE_COLORS[type] || 'var(--color-muted-foreground)',
    }))

    // Hours per project
    const byProject: Record<string, number> = {}
    for (const e of entries) {
      if (e.projectId) {
        byProject[e.projectId] =
          (byProject[e.projectId] || 0) + (e.durationMins ?? 0) / 60
      }
    }

    const projectData = Object.entries(byProject)
      .map(([projectId, hours]) => {
        const project = projects.find((p) => p.id === projectId)
        return {
          name: project?.name ?? projectId,
          hours: Math.round(hours * 10) / 10,
        }
      })
      .sort((a, b) => b.hours - a.hours)

    return {
      effectiveRate,
      declaredRate,
      breakdownData,
      projectData,
    }
  }, [client, projects, entries, t])

  return (
    <div className="space-y-4">
      {/* Effective rate card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('analysis.effectiveRate')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-6">
            <div>
              <p className="text-3xl font-bold font-mono tabular-nums">
                &euro;{analysis.effectiveRate.toFixed(0)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('analysis.effectiveRate')}
              </p>
            </div>
            <div>
              <p className="text-xl font-mono tabular-nums text-muted-foreground">
                &euro;{analysis.declaredRate}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('analysis.declaredRate')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown donut */}
      {analysis.breakdownData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('analysis.breakdown')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysis.breakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="var(--color-card)"
                    >
                      {analysis.breakdownData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {analysis.breakdownData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                    <span className="font-mono text-sm tabular-nums text-muted-foreground">
                      {item.value}u
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hours per project bar chart */}
      {analysis.projectData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('analysis.hoursPerProject')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.projectData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  />
                  <Bar
                    dataKey="hours"
                    fill="var(--color-primary)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
