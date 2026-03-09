'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  ShieldCheck,
  AlertTriangle,
  Download,
  Users,
  TrendingUp,
  Clock,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockDBAReport } from '@/lib/mock'
import type { DBAScore } from '@/lib/mock/types'

const scoreConfig: Record<DBAScore, { colorClass: string; bgClass: string }> = {
  GOOD: { colorClass: 'text-success', bgClass: 'bg-success/10' },
  MEDIUM: { colorClass: 'text-warning', bgClass: 'bg-warning/10' },
  LOW: { colorClass: 'text-destructive', bgClass: 'bg-destructive/10' },
}

export function ComplianceSettings() {
  const t = useTranslations('settings.compliance')
  const [period, setPeriod] = useState('90')

  const report = mockDBAReport
  const config = scoreConfig[report.score]
  const scoreLabel = t(`scores.${report.score.toLowerCase() as 'good' | 'medium' | 'low'}`)

  const chartData = report.clientBreakdown.map((client) => ({
    name: client.clientName,
    percentage: client.percentage,
    hours: client.hours,
    color: client.clientColor,
  }))

  return (
    <div className="max-w-4xl space-y-4">
      {/* Score card */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-6">
          <CardContent className="flex flex-col items-center p-0 text-center">
            <div className={`mb-3 flex size-16 items-center justify-center rounded-full ${config.bgClass}`}>
              <ShieldCheck className={`size-8 ${config.colorClass}`} />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('diversityScore')}</h3>
            <Badge className={`mt-1 text-base ${config.bgClass} ${config.colorClass}`}>
              {scoreLabel}
            </Badge>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardContent className="flex flex-col items-center p-0 text-center">
            <div className="mb-3 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="size-8 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('activeClients')}</h3>
            <p className="mt-1 font-mono text-2xl font-bold">{report.activeClientCount}</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardContent className="flex flex-col items-center p-0 text-center">
            <div className="mb-3 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="size-8 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('largestClient')}</h3>
            <p className="mt-1 font-mono text-2xl font-bold">{report.largestClientPercentage}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart card */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('hoursPerClient')}</CardTitle>
              <CardDescription>
                {t('period')}: {t(`periodOptions.days${period}` as 'periodOptions.days30' | 'periodOptions.days60' | 'periodOptions.days90' | 'periodOptions.days180' | 'periodOptions.days365')}
              </CardDescription>
            </div>
            <Select value={period} onValueChange={(val) => { if (val) setPeriod(val) }}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['30', '60', '90', '180', '365'].map((p) => (
                  <SelectItem key={p} value={p}>
                    {t(`periodOptions.days${p}` as 'periodOptions.days30' | 'periodOptions.days60' | 'periodOptions.days90' | 'periodOptions.days180' | 'periodOptions.days365')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                  fontSize={12}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [
                    `${value}%`,
                    '',
                  ]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                  }}
                />
                <ReferenceLine
                  x={70}
                  stroke="var(--destructive)"
                  strokeDasharray="4 4"
                  label={{
                    value: t('thresholdLine'),
                    position: 'top',
                    fill: 'var(--destructive)',
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={28}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend with hours */}
          <div className="mt-4 space-y-2">
            {report.clientBreakdown.map((client) => (
              <div key={client.clientId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: client.clientColor }}
                  />
                  <span>{client.clientName}</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span>{client.percentage}%</span>
                  <span className="text-muted-foreground">{client.hours} {t('hours')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {report.warnings.length > 0 && (
        <div className="space-y-3">
          {report.warnings.map((warning, i) => (
            <Alert key={i} variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>{warning}</AlertTitle>
            </Alert>
          ))}
        </div>
      )}

      {/* Indirect hours indicator */}
      <Card className="p-6">
        <CardContent className="flex items-center gap-4 p-0">
          <div className={`flex size-10 items-center justify-center rounded-lg ${report.hasIndirectHours ? 'bg-success/10' : 'bg-destructive/10'}`}>
            <Clock className={`size-5 ${report.hasIndirectHours ? 'text-success' : 'text-destructive'}`} />
          </div>
          <div>
            <h3 className="text-sm font-medium">{t('indirectHours')}</h3>
            <p className="text-sm text-muted-foreground">
              {report.hasIndirectHours ? '✓' : '✗'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Download button */}
      <Button variant="outline">
        <Download className="mr-1.5 size-4" />
        {t('downloadPdf')}
      </Button>
    </div>
  )
}
