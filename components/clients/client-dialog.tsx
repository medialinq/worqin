'use client'

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
import type { Client } from '@/lib/mock/types'

const PRESET_COLORS = [
  '#3D52D5',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#F97316',
]

const clientSchema = z.object({
  name: z.string().min(1),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  color: z.string().min(1),
  hourlyRate: z.string().optional(),
  kmRate: z.string().optional(),
  minimumMinutes: z.string().optional(),
  jorttId: z.string().optional(),
})

type ClientFormValues = z.infer<typeof clientSchema>

interface ClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client
}

export function ClientDialog({ open, onOpenChange, client }: ClientDialogProps) {
  const t = useTranslations('clients')
  const tc = useTranslations('common')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name ?? '',
      email: client?.email ?? '',
      color: client?.color ?? PRESET_COLORS[0],
      hourlyRate: client?.hourlyRate?.toString() ?? '',
      kmRate: client?.kmRate?.toString() ?? '',
      minimumMinutes: client?.minimumMinutes?.toString() ?? '',
      jorttId: client?.jorttId ?? '',
    },
  })

  const selectedColor = watch('color')

  function onSubmit(_data: ClientFormValues) {
    // Phase 1: just close dialog (mock data, no persistence)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) reset()
        onOpenChange(val)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {client ? t('editClient') : t('addClient')}
          </DialogTitle>
          <DialogDescription>
            {client ? t('dialog.editDescription') : t('dialog.addDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('fields.name')}</label>
            <Input
              {...register('name')}
              aria-invalid={!!errors.name}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('fields.email')}</label>
            <Input
              type="email"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('fields.color')}</label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`size-7 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? 'border-foreground scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                />
              ))}
              <Input
                {...register('color')}
                className="w-24"
                placeholder="#hex"
              />
            </div>
          </div>

          {/* Hourly rate */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('fields.hourlyRate')}</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('hourlyRate')}
            />
          </div>

          {/* Km rate */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('fields.kmRate')}</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('kmRate')}
            />
          </div>

          {/* Minimum minutes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('fields.minimumMinutes')}</label>
            <Input
              type="number"
              step="1"
              min="0"
              {...register('minimumMinutes')}
            />
          </div>

          {/* External links section */}
          <div className="space-y-1.5 border-t border-border pt-4">
            <p className="text-sm font-medium text-muted-foreground">
              {t('externalLinks')}
            </p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('fields.jorttId')}</label>
              <Input {...register('jorttId')} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
            >
              {tc('cancel')}
            </Button>
            <Button type="submit">{tc('save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
