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
import { Textarea } from '@/components/ui/textarea'
import type { Project } from '@/lib/mock/types'

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  budgetHours: z.string().optional(),
  hourlyRate: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  clientName: string
  project?: Project
}

export function ProjectDialog({
  open,
  onOpenChange,
  clientId: _clientId,
  clientName,
  project,
}: ProjectDialogProps) {
  const t = useTranslations('clients')
  const tc = useTranslations('common')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? '',
      description: project?.description ?? '',
      budgetHours: project?.budgetHours?.toString() ?? '',
      hourlyRate: project?.hourlyRate?.toString() ?? '',
    },
  })

  function onSubmit(_data: ProjectFormValues) {
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
            {project ? t('project.edit') : t('project.add')}
          </DialogTitle>
          <DialogDescription>
            {clientName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Client (pre-filled, disabled) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('fields.client')}</label>
            <Input
              value={clientName}
              disabled
              className="opacity-60"
            />
          </div>

          {/* Project name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('fields.projectName')}</label>
            <Input
              {...register('name')}
              aria-invalid={!!errors.name}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('fields.description')}</label>
            <Textarea {...register('description')} rows={3} />
          </div>

          {/* Budget hours */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('fields.budgetHours')}</label>
            <Input
              type="number"
              step="1"
              min="0"
              {...register('budgetHours')}
            />
          </div>

          {/* Custom hourly rate */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              {t('fields.projectHourlyRate')}
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('hourlyRate')}
            />
            <p className="text-xs text-muted-foreground">
              {t('fields.projectHourlyRateHint')}
            </p>
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
