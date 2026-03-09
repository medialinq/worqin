'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CashflowMonth, CashflowSettings } from '@/lib/mock/types'
import { cn } from '@/lib/utils'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatMonthName(monthStr: string, locale: string): string {
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'nl-NL', {
    month: 'long',
    year: 'numeric',
  })
}

function getVatPeriodLabel(monthStr: string): string | null {
  const month = parseInt(monthStr.split('-')[1])
  // Q1 VAT paid in April, Q2 in July, Q3 in October, Q4 in January
  const quarterMap: Record<number, string> = {
    4: 'Q1',
    7: 'Q2',
    10: 'Q3',
    1: 'Q4',
  }
  return quarterMap[month] ?? null
}

function getBorderColor(
  month: CashflowMonth,
  safetyBuffer: number,
): string {
  if (month.cumulativeBalance < 0) return 'ring-red-500/50'
  if (month.cumulativeBalance < safetyBuffer) return 'ring-orange-500/50'
  return 'ring-green-500/50'
}

interface MonthCardsProps {
  months: CashflowMonth[]
  settings: CashflowSettings
}

export function MonthCards({ months, settings }: MonthCardsProps) {
  const t = useTranslations('financial.cashflow')

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {months.map((month) => {
        const borderColor = getBorderColor(month, settings.safetyBuffer)
        const vatPeriod = month.vatPayment > 0 ? getVatPeriodLabel(month.month) : null

        return (
          <Card
            key={month.month}
            className={cn('ring-2', borderColor)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="capitalize">
                  {formatMonthName(month.month, 'nl')}
                </span>
                {vatPeriod && (
                  <Badge variant="outline" className="text-xs">
                    {t('vatMoment')} {vatPeriod}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Revenue */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('revenue')}
                </span>
                <span className="font-mono tabular-nums text-green-600 dark:text-green-400">
                  {formatCurrency(month.expectedRevenue)}
                </span>
              </div>

              {/* Fixed expenses */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('expenses')}
                </span>
                <span className="font-mono tabular-nums text-red-600 dark:text-red-400">
                  -{formatCurrency(month.fixedExpenses)}
                </span>
              </div>

              {/* Tax reserve */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('tax')}
                </span>
                <span className="font-mono tabular-nums text-orange-600 dark:text-orange-400">
                  -{formatCurrency(month.taxReserve)}
                </span>
              </div>

              {/* VAT payment if applicable */}
              {month.vatPayment > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t('vatMoment')}
                  </span>
                  <span className="font-mono tabular-nums text-red-600 dark:text-red-400">
                    -{formatCurrency(month.vatPayment)}
                  </span>
                </div>
              )}

              {/* Divider */}
              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('balance')}
                  </span>
                  <span
                    className={cn(
                      'font-mono tabular-nums font-bold',
                      month.netBalance >= 0
                        ? 'text-foreground'
                        : 'text-red-600 dark:text-red-400',
                    )}
                  >
                    {formatCurrency(month.netBalance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function MonthCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
            <div className="border-t pt-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                <div className="h-5 w-20 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
