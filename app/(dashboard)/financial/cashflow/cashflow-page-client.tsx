'use client'

import { useTranslations } from 'next-intl'
import { Settings } from 'lucide-react'
import { MonthCards } from '@/components/financial/month-cards'
import { CashflowChart } from '@/components/financial/cashflow-chart'
import { CashflowSettingsForm } from '@/components/financial/cashflow-settings-form'
import { Card, CardContent } from '@/components/ui/card'

interface CashflowPageClientProps {
  settings: {
    id: string
    organization_id: string
    monthly_fixed_expenses: number
    tax_reserve_percentage: number
    current_balance: number
    safety_buffer: number
    vat_frequency: string
    updated_at: string
  } | null
}

export function CashflowPageClient({ settings }: CashflowPageClientProps) {
  const t = useTranslations('financial.cashflow')

  const hasSettings = !!settings

  // Transform DB snake_case to the camelCase shape components expect
  const settingsFormatted = settings
    ? {
        id: settings.id,
        organizationId: settings.organization_id,
        monthlyFixedExpenses: settings.monthly_fixed_expenses,
        taxReservePercentage: settings.tax_reserve_percentage,
        currentBalance: settings.current_balance,
        safetyBuffer: settings.safety_buffer,
        vatFrequency: settings.vat_frequency as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
        updatedAt: settings.updated_at,
      }
    : null

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
        <CashflowSettingsForm settings={{
          id: '',
          organizationId: '',
          monthlyFixedExpenses: 0,
          taxReservePercentage: 21,
          currentBalance: 0,
          safetyBuffer: 1000,
          vatFrequency: 'QUARTERLY' as const,
          updatedAt: new Date().toISOString(),
        }} />
      </div>
    )
  }

  // When settings exist, compute forecast months client-side
  // (In a full implementation, months would be computed server-side or via an API)
  const months: {
    month: string
    expectedRevenue: number
    fixedExpenses: number
    taxReserve: number
    vatPayment: number
    netBalance: number
    cumulativeBalance: number
    status: 'positive' | 'warning' | 'negative'
  }[] = []

  return (
    <div className="space-y-4">
      {/* Month cards */}
      <MonthCards months={months} settings={settingsFormatted!} />

      {/* Chart */}
      <CashflowChart months={months} settings={settingsFormatted!} />

      {/* Settings form */}
      <CashflowSettingsForm settings={settingsFormatted!} />
    </div>
  )
}
