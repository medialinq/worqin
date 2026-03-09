'use client'

import { useTranslations } from 'next-intl'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { DashboardStats } from '@/lib/mock/types'

interface KPICardsProps {
  stats: DashboardStats
}

export function KPICards({ stats }: KPICardsProps) {
  const t = useTranslations('dashboard')

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <WeekHoursCard
        current={stats.weekHours.current}
        goal={stats.weekHours.goal}
        label={t('weekHours')}
        hoursLabel={t('hours')}
      />
      <YearProgressCard
        totalHours={stats.yearProgress.totalHours}
        directHours={stats.yearProgress.directHours}
        indirectHours={stats.yearProgress.indirectHours}
        percentage={stats.yearProgress.percentage}
        label={t('yearProgress')}
        directLabel={t('direct')}
        indirectLabel={t('indirect')}
        remainingLabel={t('remaining')}
        hoursShort={t('hoursShort')}
      />
      <RevenueMTDCard
        revenue={stats.revenueMTD}
        lastMonth={stats.revenueLastMonth}
        label={t('revenueMTD')}
        sublabel={t('thisMonth')}
        vsLastMonth={t('vsLastMonth')}
      />
    </div>
  )
}

function WeekHoursCard({
  current,
  goal,
  label,
  hoursLabel,
}: {
  current: number
  goal: number
  label: string
  hoursLabel: string
}) {
  const percentage = Math.round((current / goal) * 100)

  return (
    <Card>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono tabular-nums text-3xl font-bold">
            {current}
          </span>
          <span className="text-sm text-muted-foreground">/ {goal} {hoursLabel}</span>
        </div>
        <Progress value={percentage}>
          <span className="sr-only">{percentage}%</span>
        </Progress>
      </CardContent>
    </Card>
  )
}

function YearProgressCard({
  totalHours,
  directHours,
  indirectHours,
  percentage,
  label,
  directLabel,
  indirectLabel,
  remainingLabel,
  hoursShort,
}: {
  totalHours: number
  directHours: number
  indirectHours: number
  percentage: number
  label: string
  directLabel: string
  indirectLabel: string
  remainingLabel: string
  hoursShort: string
}) {
  const TARGET = 1225
  const remaining = TARGET - totalHours

  const data = [
    { name: directLabel, value: directHours, color: 'var(--color-billable)' },
    { name: indirectLabel, value: indirectHours, color: 'var(--color-muted-foreground)' },
    { name: remainingLabel, value: remaining > 0 ? remaining : 0, color: 'var(--color-muted)' },
  ]

  // Orange for 70-99%, green for 100%+, default for <70%
  const ringColor =
    percentage >= 100
      ? 'text-success'
      : percentage >= 70
        ? 'text-warning'
        : 'text-muted-foreground'

  return (
    <Card>
      <CardContent className="space-y-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-center justify-center py-1">
          <div className="relative h-[120px] w-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={54}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const item = payload[0]
                    if (item.name === remainingLabel) return null
                    return (
                      <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-sm">
                        <span className="font-medium">{item.name}:</span>{' '}
                        <span className="font-mono tabular-nums">
                          {item.value}{hoursShort}
                        </span>
                      </div>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-mono tabular-nums text-lg font-bold ${ringColor}`}>
                {totalHours}{hoursShort}
              </span>
              <span className="text-xs text-muted-foreground">/ {TARGET.toLocaleString('nl-NL')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RevenueMTDCard({
  revenue,
  lastMonth,
  label,
  sublabel,
  vsLastMonth,
}: {
  revenue: number
  lastMonth: number
  label: string
  sublabel: string
  vsLastMonth: string
}) {
  const diff = revenue - lastMonth
  const diffPercentage = lastMonth > 0 ? Math.round((diff / lastMonth) * 100) : 0

  return (
    <Card>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono tabular-nums text-3xl font-bold">
            &euro;{revenue.toLocaleString('nl-NL')}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{sublabel}</p>
        <div className="flex items-center gap-1.5 text-sm">
          {diff > 0 ? (
            <TrendingUp className="size-4 text-success" />
          ) : diff < 0 ? (
            <TrendingDown className="size-4 text-error" />
          ) : (
            <Minus className="size-4 text-muted-foreground" />
          )}
          <span
            className={
              diff > 0
                ? 'text-success'
                : diff < 0
                  ? 'text-error'
                  : 'text-muted-foreground'
            }
          >
            {diffPercentage > 0 ? '+' : ''}
            {diffPercentage}%
          </span>
          <span className="text-muted-foreground">{vsLastMonth}</span>
        </div>
      </CardContent>
    </Card>
  )
}
