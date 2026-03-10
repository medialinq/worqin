'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
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
import { createProject, updateProject } from '@/app/(dashboard)/customers/[id]/actions'
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
  clientId,
  clientName,
  project,
}: ProjectDialogProps) {
  const t = useTranslations('clients')
  const tc = useTranslations('common')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

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

  async function onSubmit(data: ProjectFormValues) {
    setIsSubmitting(true)
    setServerError(null)

    const payload = {
      name: data.name,
      description: data.description || undefined,
      budgetHours: data.budgetHours ? parseFloat(data.budgetHours) : null,
      hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
    }

    const result = project
      ? await updateProject({ id: project.id, ...payload })
      : await createProject({ clientId, ...payload })

    setIsSubmitting(false)

    if ('error' in result) {
      setServerError(result.error)
      return
    }

    reset()
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          reset()
          setServerError(null)
        }
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

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                reset()
                setServerError(null)
                onOpenChange(false)
              }}
            >
              {tc('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tc('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
