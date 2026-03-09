'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CashflowForecast } from '@/lib/mock/types'

interface CashflowWidgetProps {
  forecast: CashflowForecast
}

export function CashflowWidget({ forecast }: CashflowWidgetProps) {
  const t = useTranslations('dashboard.cashflow')
  const { summary, settings } = forecast

  const isAboveBuffer = summary.endBalance > settings.safetyBuffer
  const barColor = isAboveBuffer ? 'bg-success' : 'bg-warning'
  const barWidth = Math.min(
    100,
    Math.round((summary.endBalance / (settings.safetyBuffer * 2)) * 100)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">{t('next90days')}</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('expectedRevenue')}</span>
            <span className="font-mono tabular-nums font-medium">
              &euro;{summary.totalExpectedRevenue.toLocaleString('nl-NL')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('fixedExpenses')}</span>
            <span className="font-mono tabular-nums font-medium">
              &euro;{summary.totalExpenses.toLocaleString('nl-NL')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('expectedBalance')}</span>
            <span className="font-mono tabular-nums font-bold">
              &euro;{summary.endBalance.toLocaleString('nl-NL')}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${barColor} transition-all`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>

        <Link
          href="/financial/cashflow"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-full gap-1.5')}
        >
          {t('viewDetails')}
          <ArrowRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  )
}
