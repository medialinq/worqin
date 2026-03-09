'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Settings } from 'lucide-react'
import { MonthCards, MonthCardsSkeleton } from '@/components/financial/month-cards'
import { CashflowChart, CashflowChartSkeleton } from '@/components/financial/cashflow-chart'
import { CashflowSettingsForm } from '@/components/financial/cashflow-settings-form'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockCashflowForecast } from '@/lib/mock/cashflow'

export function CashflowPageClient() {
  const t = useTranslations('financial.cashflow')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const forecast = mockCashflowForecast
  const hasSettings = !!forecast.settings

  if (loading) {
    return (
      <div className="space-y-4">
        <MonthCardsSkeleton />
        <CashflowChartSkeleton />
      </div>
    )
  }

  if (!hasSettings) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <Settings className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium">{t('settings.title')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('forecast')}
            </p>
          </CardContent>
        </Card>
        <CashflowSettingsForm settings={forecast.settings} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Month cards */}
      <MonthCards months={forecast.months} settings={forecast.settings} />

      {/* Chart */}
      <CashflowChart months={forecast.months} settings={forecast.settings} />

      {/* Settings form */}
      <CashflowSettingsForm settings={forecast.settings} />
    </div>
  )
}
