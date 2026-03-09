'use client'

import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import type { LeaveType } from '@/lib/mock/types'

const LEAVE_COLORS: Record<LeaveType, string> = {
  VACATION: '#3B82F6',
  SICK: '#EF4444',
  MATERNITY: '#EC4899',
  PUBLIC_HOLIDAY: '#F59E0B',
  OTHER: '#6B7280',
}

const LEAVE_TYPE_KEYS: Record<LeaveType, string> = {
  VACATION: 'vacation',
  SICK: 'sick',
  MATERNITY: 'maternity',
  PUBLIC_HOLIDAY: 'publicHoliday',
  OTHER: 'other',
}

const LEAVE_TYPES: LeaveType[] = ['VACATION', 'SICK', 'MATERNITY', 'PUBLIC_HOLIDAY', 'OTHER']

function todayString(): string {
  return new Date().toISOString().split('T')[0]
}

const leaveSchema = z.object({
  date: z.string().min(1),
  type: z.string().min(1),
  notes: z.string().optional(),
})

type LeaveFormValues = z.infer<typeof leaveSchema>

interface LeaveFormProps {
  onSubmitted?: () => void
}

export function LeaveForm({ onSubmitted }: LeaveFormProps) {
  const t = useTranslations('financial.leave')
  const tCommon = useTranslations('common')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      date: todayString(),
      type: 'VACATION',
      notes: '',
    },
  })

  const selectedType = (watch('type') || 'VACATION') as LeaveType
  const typeKey = LEAVE_TYPE_KEYS[selectedType] ?? 'other'

  function onSubmit(_data: LeaveFormValues) {
    // Phase 1: mock — just reset
    reset({
      date: todayString(),
      type: 'VACATION',
      notes: '',
    })
    onSubmitted?.()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('addLeave')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('date')}</label>
            <Input
              type="date"
              {...register('date')}
              aria-invalid={!!errors.date}
              className="font-mono tabular-nums"
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('type')}</label>
            <Select
              value={selectedType}
              onValueChange={(val) => setValue('type', val ?? 'VACATION')}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block size-2.5 rounded-full"
                        style={{ backgroundColor: LEAVE_COLORS[type] }}
                      />
                      {t(`types.${LEAVE_TYPE_KEYS[type]}`)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tax context tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Info className="size-3.5" />
                      {t(`taxContext.${typeKey}`)}
                    </button>
                  }
                />
                <TooltipContent>
                  <p>{t(`taxContext.${typeKey}`)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('notes')}</label>
            <Textarea
              {...register('notes')}
              rows={3}
            />
          </div>

          {/* Save */}
          <Button type="submit" className="w-full">
            {tCommon('save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
