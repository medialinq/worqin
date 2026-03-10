'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { updateCashflowSettings } from '@/app/(dashboard)/financial/cashflow/actions'
import { Check } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CashflowSettings } from '@/lib/mock/types'

const cashflowSettingsSchema = z.object({
  monthlyFixedExpenses: z.string().min(1),
  taxReservePercentage: z.string().min(1),
  currentBalance: z.string().min(1),
  safetyBuffer: z.string().min(1),
  vatFrequency: z.string().min(1),
})

type CashflowSettingsFormValues = z.infer<typeof cashflowSettingsSchema>

interface CashflowSettingsFormProps {
  settings: CashflowSettings
}

export function CashflowSettingsForm({ settings }: CashflowSettingsFormProps) {
  const t = useTranslations('financial.cashflow.settings')
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CashflowSettingsFormValues>({
    resolver: zodResolver(cashflowSettingsSchema),
    defaultValues: {
      monthlyFixedExpenses: settings.monthlyFixedExpenses.toString(),
      taxReservePercentage: settings.taxReservePercentage.toString(),
      currentBalance: settings.currentBalance.toString(),
      safetyBuffer: settings.safetyBuffer.toString(),
      vatFrequency: settings.vatFrequency,
    },
  })

  const vatFrequency = watch('vatFrequency')

  async function onSubmit(data: CashflowSettingsFormValues) {
    setLoading(true)
    setError(null)
    const result = await updateCashflowSettings({
      currentBalance: parseFloat(data.currentBalance),
      monthlyFixedExpenses: parseFloat(data.monthlyFixedExpenses),
      taxReservePercentage: parseInt(data.taxReservePercentage, 10),
      safetyBuffer: parseFloat(data.safetyBuffer),
      vatFrequency: data.vatFrequency as string,
    })
    setLoading(false)
    if ('error' in result) { setError(result.error); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Monthly fixed expenses */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('monthlyExpenses')}</label>
            <Input
              type="number"
              step="1"
              min="0"
              {...register('monthlyFixedExpenses')}
              aria-invalid={!!errors.monthlyFixedExpenses}
              className="font-mono tabular-nums"
            />
          </div>

          {/* Tax reserve percentage */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('taxPercentage')}</label>
            <Input
              type="number"
              step="1"
              min="0"
              max="100"
              {...register('taxReservePercentage')}
              aria-invalid={!!errors.taxReservePercentage}
              className="font-mono tabular-nums"
            />
          </div>

          {/* Current balance */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('currentBalance')}</label>
            <Input
              type="number"
              step="1"
              {...register('currentBalance')}
              aria-invalid={!!errors.currentBalance}
              className="font-mono tabular-nums"
            />
          </div>

          {/* Safety buffer */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('safetyBuffer')}</label>
            <Input
              type="number"
              step="1"
              min="0"
              {...register('safetyBuffer')}
              aria-invalid={!!errors.safetyBuffer}
              className="font-mono tabular-nums"
            />
          </div>

          {/* VAT frequency */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('vatFrequency')}</label>
            <Select
              value={vatFrequency}
              onValueChange={(val) => setValue('vatFrequency', val ?? 'QUARTERLY')}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">
                  {t('vatOptions.monthly')}
                </SelectItem>
                <SelectItem value="QUARTERLY">
                  {t('vatOptions.quarterly')}
                </SelectItem>
                <SelectItem value="YEARLY">
                  {t('vatOptions.yearly')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Save */}
          <div className="flex items-center gap-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {t('save')}
            </Button>
            {saved && (
              <span className="flex shrink-0 items-center gap-1 text-sm text-success">
                <Check className="size-4" />
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
