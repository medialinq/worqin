'use client'

import { useTranslations } from 'next-intl'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CashflowMonth, CashflowSettings } from '@/lib/mock/types'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatMonthShort(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('nl-NL', { month: 'short' })
}

function getVatQuarterLabel(monthStr: string): string | null {
  const month = parseInt(monthStr.split('-')[1])
  const quarterMap: Record<number, string> = {
    4: 'BTW Q1',
    7: 'BTW Q2',
    10: 'BTW Q3',
    1: 'BTW Q4',
  }
  return quarterMap[month] ?? null
}

interface ChartDataPoint {
  month: string
  label: string
  cumulativeBalance: number
  vatPayment: number
  revenue: number
  expenses: number
  taxReserve: number
  netBalance: number
}

interface CashflowChartProps {
  months: CashflowMonth[]
  settings: CashflowSettings
}

function CustomTooltip({
  active,
  payload,
  t,
}: {
  active?: boolean
  payload?: Array<{ payload: ChartDataPoint }>
  t: ReturnType<typeof useTranslations>
}) {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload

  return (
    <div className="rounded-lg border bg-card p-3 shadow-md">
      <p className="mb-2 text-sm font-medium capitalize">{data.label}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-6">
          <span className="text-muted-foreground">{t('revenue')}</span>
          <span className="font-mono tabular-nums text-green-600 dark:text-green-400">
            {formatCurrency(data.revenue)}
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-muted-foreground">{t('expenses')}</span>
          <span className="font-mono tabular-nums text-red-600 dark:text-red-400">
            -{formatCurrency(data.expenses)}
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-muted-foreground">{t('tax')}</span>
          <span className="font-mono tabular-nums text-orange-600 dark:text-orange-400">
            -{formatCurrency(data.taxReserve)}
          </span>
        </div>
        {data.vatPayment > 0 && (
          <div className="flex justify-between gap-6">
            <span className="text-muted-foreground">{t('vatMoment')}</span>
            <span className="font-mono tabular-nums text-red-600 dark:text-red-400">
              -{formatCurrency(data.vatPayment)}
            </span>
          </div>
        )}
        <div className="flex justify-between gap-6 border-t pt-1">
          <span className="font-medium">{t('balance')}</span>
          <span className="font-mono tabular-nums font-bold">
            {formatCurrency(data.cumulativeBalance)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function CashflowChart({ months, settings }: CashflowChartProps) {
  const t = useTranslations('financial.cashflow')

  const chartData: ChartDataPoint[] = months.map((m) => ({
    month: m.month,
    label: formatMonthShort(m.month),
    cumulativeBalance: m.cumulativeBalance,
    vatPayment: m.vatPayment,
    revenue: m.expectedRevenue,
    expenses: m.fixedExpenses,
    taxReserve: m.taxReserve,
    netBalance: m.netBalance,
  }))

  // Find min/max for Y axis
  const allBalances = chartData.map((d) => d.cumulativeBalance)
  const minBalance = Math.min(...allBalances, 0)
  const maxBalance = Math.max(...allBalances, settings.safetyBuffer * 1.5)
  const yMin = Math.floor(minBalance / 1000) * 1000 - 1000
  const yMax = Math.ceil(maxBalance / 1000) * 1000 + 1000

  // VAT months for reference lines
  const vatMonths = chartData.filter((d) => d.vatPayment > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('forecast')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[yMin, yMax]}
                tickFormatter={(val: number) => `${Math.round(val / 1000)}k`}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                width={40}
              />
              <RechartsTooltip
                content={({ active, payload }) => (
                  <CustomTooltip active={active} payload={payload as unknown as Array<{ payload: ChartDataPoint }>} t={t} />
                )}
              />

              {/* Break-even line */}
              <ReferenceLine
                y={0}
                stroke="#EF4444"
                strokeDasharray="6 4"
                label={{
                  value: 'Break-even',
                  position: 'insideBottomRight',
                  fontSize: 11,
                  fill: '#EF4444',
                }}
              />

              {/* Safety buffer line */}
              <ReferenceLine
                y={settings.safetyBuffer}
                stroke="#F59E0B"
                strokeDasharray="6 4"
                label={{
                  value: t('buffer'),
                  position: 'insideTopRight',
                  fontSize: 11,
                  fill: '#F59E0B',
                }}
              />

              {/* VAT moment vertical lines */}
              {vatMonths.map((vm) => {
                const label = getVatQuarterLabel(vm.month)
                return (
                  <ReferenceLine
                    key={vm.month}
                    x={vm.label}
                    stroke="#8B5CF6"
                    strokeDasharray="4 4"
                    label={{
                      value: label ?? '',
                      position: 'top',
                      fontSize: 10,
                      fill: '#8B5CF6',
                    }}
                  />
                )
              })}

              {/* Area fill */}
              <Area
                type="monotone"
                dataKey="cumulativeBalance"
                fill="#22C55E"
                fillOpacity={0.1}
                stroke="none"
              />

              {/* Line */}
              <Line
                type="monotone"
                dataKey="cumulativeBalance"
                stroke="#22C55E"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#22C55E', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function CashflowChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}
