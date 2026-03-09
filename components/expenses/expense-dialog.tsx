'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockClients } from '@/lib/mock/clients'
import type { Expense } from '@/lib/mock/types'

const KM_RATE = 0.23

const receiptSchema = z.object({
  description: z.string().min(1),
  amount: z.string().min(1),
  vatRate: z.string(),
  date: z.string().min(1),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
})

const mileageSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  km: z.string().min(1),
  date: z.string().min(1),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
})

type ReceiptFormValues = z.infer<typeof receiptSchema>
type MileageFormValues = z.infer<typeof mileageSchema>

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: Expense
}

function todayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function ExpenseDialog({ open, onOpenChange, expense }: ExpenseDialogProps) {
  const t = useTranslations('expenses')
  const tc = useTranslations('common')

  const isEdit = !!expense
  const isMileage = expense?.type === 'MILEAGE'

  const [activeTab, setActiveTab] = useState<string>(isMileage ? 'mileage' : 'receipt')
  const [fileSelected, setFileSelected] = useState(false)

  // Receipt form
  const receiptForm = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      description: '',
      amount: '',
      vatRate: '21',
      date: todayString(),
      clientId: '',
      projectId: '',
    },
  })

  // Mileage form
  const mileageForm = useForm<MileageFormValues>({
    resolver: zodResolver(mileageSchema),
    defaultValues: {
      from: '',
      to: '',
      km: '',
      date: todayString(),
      clientId: '',
      projectId: '',
    },
  })

  // Watch km for calculated amount
  const watchedKm = mileageForm.watch('km')
  const calculatedAmount = useMemo(() => {
    const km = parseFloat(watchedKm || '0')
    if (isNaN(km) || km <= 0) return 0
    return Math.round(km * KM_RATE * 100) / 100
  }, [watchedKm])

  // Populate forms when editing
  useEffect(() => {
    if (!open) return

    if (expense) {
      setActiveTab(expense.type === 'MILEAGE' ? 'mileage' : 'receipt')

      if (expense.type === 'MILEAGE') {
        // Try to parse "Van -> Naar" from description
        const parts = expense.description.split('\u2192')
        const fromVal = parts[0]?.trim() ?? ''
        const toVal = parts[1]?.trim() ?? ''
        const km = Math.round(expense.amount / KM_RATE)
        mileageForm.reset({
          from: fromVal,
          to: toVal,
          km: km.toString(),
          date: expense.date,
          clientId: expense.clientId ?? undefined,
          projectId: expense.projectId ?? undefined,
        })
      } else {
        receiptForm.reset({
          description: expense.description,
          amount: expense.amount.toString(),
          vatRate: expense.vatRate?.toString() ?? '21',
          date: expense.date,
          clientId: expense.clientId ?? undefined,
          projectId: expense.projectId ?? undefined,
        })
      }
    } else {
      setActiveTab('receipt')
      receiptForm.reset({
        description: '',
        amount: '',
        vatRate: '21',
        date: todayString(),
        clientId: '',
        projectId: '',
      })
      mileageForm.reset({
        from: '',
        to: '',
        km: '',
        date: todayString(),
        clientId: '',
        projectId: '',
      })
      setFileSelected(false)
    }
  }, [open, expense, receiptForm, mileageForm])

  function onSubmitReceipt(_data: ReceiptFormValues) {
    // Phase 1: mock — just close
    receiptForm.reset()
    onOpenChange(false)
  }

  function onSubmitMileage(_data: MileageFormValues) {
    // Phase 1: mock — just close
    mileageForm.reset()
    onOpenChange(false)
  }

  function handleClose() {
    receiptForm.reset()
    mileageForm.reset()
    setFileSelected(false)
    onOpenChange(false)
  }

  const activeClients = mockClients.filter((c) => c.isActive)

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('editExpense') : t('addExpense')}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t('editExpense') : t('addExpense')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as string)}>
          <TabsList>
            <TabsTrigger value="receipt" disabled={isEdit && isMileage}>
              {t('tabs.receipt')}
            </TabsTrigger>
            <TabsTrigger value="mileage" disabled={isEdit && !isMileage}>
              {t('tabs.mileage')}
            </TabsTrigger>
          </TabsList>

          {/* Receipt tab */}
          <TabsContent value="receipt">
            <form onSubmit={receiptForm.handleSubmit(onSubmitReceipt)} className="space-y-4 pt-2">
              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('fields.description')}</label>
                <Input
                  {...receiptForm.register('description')}
                  aria-invalid={!!receiptForm.formState.errors.description}
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('fields.amount')}</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...receiptForm.register('amount')}
                  aria-invalid={!!receiptForm.formState.errors.amount}
                  className="font-mono tabular-nums"
                />
              </div>

              {/* VAT rate */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('fields.vatRate')}</label>
                <Select
                  value={receiptForm.watch('vatRate')}
                  onValueChange={(val) => receiptForm.setValue('vatRate', val ?? '21')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="9">9%</SelectItem>
                    <SelectItem value="21">21%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('fields.date')}</label>
                <Input
                  type="date"
                  {...receiptForm.register('date')}
                  aria-invalid={!!receiptForm.formState.errors.date}
                  className="font-mono tabular-nums"
                />
              </div>

              {/* Client (optional) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('fields.client')}</label>
                <Select
                  value={receiptForm.watch('clientId') ?? ''}
                  onValueChange={(val) => receiptForm.setValue('clientId', val ?? undefined)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-</SelectItem>
                    {activeClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Receipt upload (mock) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('upload')}</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={() => setFileSelected(true)}
                    className="text-sm"
                  />
                  {fileSelected && (
                    <span className="shrink-0 text-xs text-green-600">{t('fileSelected')}</span>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  {tc('cancel')}
                </Button>
                <Button type="submit">{tc('save')}</Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Mileage tab */}
          <TabsContent value="mileage">
            <form onSubmit={mileageForm.handleSubmit(onSubmitMileage)} className="space-y-4 pt-2">
              {/* From */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('fields.from')}</label>
                <Input
                  {...mileageForm.register('from')}
                  aria-invalid={!!mileageForm.formState.errors.from}
                />
              </div>

              {/* To */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('fields.to')}</label>
                <Input
                  {...mileageForm.register('to')}
                  aria-invalid={!!mileageForm.formState.errors.to}
                />
              </div>

              {/* Kilometers */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('fields.km')}</label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  {...mileageForm.register('km')}
                  aria-invalid={!!mileageForm.formState.errors.km}
                  className="font-mono tabular-nums"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t('kmRate')}</span>
                  {calculatedAmount > 0 && (
                    <span className="font-mono tabular-nums">
                      {t('calculated', { amount: calculatedAmount.toFixed(2) })}
                    </span>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('fields.date')}</label>
                <Input
                  type="date"
                  {...mileageForm.register('date')}
                  aria-invalid={!!mileageForm.formState.errors.date}
                  className="font-mono tabular-nums"
                />
              </div>

              {/* Client (optional) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('fields.client')}</label>
                <Select
                  value={mileageForm.watch('clientId') ?? ''}
                  onValueChange={(val) => mileageForm.setValue('clientId', val ?? undefined)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-</SelectItem>
                    {activeClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  {tc('cancel')}
                </Button>
                <Button type="submit">{tc('save')}</Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
