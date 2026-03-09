'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Plus,
  Star,
  Pencil,
  Trash2,
  Timer,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockTimerTemplates, mockClients, mockProjects } from '@/lib/mock'
import type { TimerTemplate, TimeEntryType } from '@/lib/mock/types'

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

const templateSchema = z.object({
  name: z.string().min(1),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  type: z.string().min(1),
  defaultMins: z.string().optional(),
  color: z.string().optional(),
})

type TemplateFormValues = z.infer<typeof templateSchema>

export function TemplatesSettings() {
  const t = useTranslations('settings.templates')
  const tc = useTranslations('common')
  const tt = useTranslations('timer.types')

  const [templates, setTemplates] = useState<TimerTemplate[]>(mockTimerTemplates)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TimerTemplate | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const typeOptions: { value: TimeEntryType; label: string }[] = [
    { value: 'BILLABLE', label: tt('billable') },
    { value: 'NON_BILLABLE', label: tt('nonBillable') },
    { value: 'PRO_BONO', label: tt('proBono') },
    { value: 'INDIRECT_ADMIN', label: tt('admin') },
    { value: 'INDIRECT_SALES', label: tt('sales') },
    { value: 'INDIRECT_TRAVEL', label: tt('travel') },
    { value: 'INDIRECT_LEARNING', label: tt('learning') },
    { value: 'INDIRECT_OTHER', label: tt('other') },
  ]

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      clientId: '',
      projectId: '',
      type: 'BILLABLE',
      defaultMins: '',
      color: '',
    },
  })

  function openAdd() {
    setEditingTemplate(null)
    form.reset({
      name: '',
      clientId: '',
      projectId: '',
      type: 'BILLABLE',
      defaultMins: '',
      color: '',
    })
    setDialogOpen(true)
  }

  function openEdit(template: TimerTemplate) {
    setEditingTemplate(template)
    form.reset({
      name: template.name,
      clientId: template.clientId ?? '',
      projectId: template.projectId ?? '',
      type: template.type,
      defaultMins: template.defaultMins?.toString() ?? '',
      color: template.color ?? '',
    })
    setDialogOpen(true)
  }

  function onSubmit(data: TemplateFormValues) {
    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((tmpl) =>
          tmpl.id === editingTemplate.id
            ? {
                ...tmpl,
                name: data.name,
                clientId: data.clientId || null,
                projectId: data.projectId || null,
                type: data.type as TimeEntryType,
                defaultMins: data.defaultMins ? Number(data.defaultMins) : null,
                color: data.color || null,
              }
            : tmpl
        )
      )
    } else {
      const newTemplate: TimerTemplate = {
        id: `tmpl-new-${Date.now()}`,
        organizationId: templates[0]?.organizationId ?? '',
        userId: templates[0]?.userId ?? '',
        name: data.name,
        clientId: data.clientId || null,
        projectId: data.projectId || null,
        description: null,
        type: data.type as TimeEntryType,
        defaultMins: data.defaultMins ? Number(data.defaultMins) : null,
        color: data.color || null,
        isFavorite: false,
        usageCount: 0,
        lastUsedAt: null,
        createdAt: new Date().toISOString(),
      }
      setTemplates((prev) => [...prev, newTemplate])
    }
    form.reset()
    setDialogOpen(false)
    setEditingTemplate(null)
  }

  function handleDelete(id: string) {
    setTemplates((prev) => prev.filter((tmpl) => tmpl.id !== id))
    setDeleteConfirmId(null)
  }

  function toggleFavorite(id: string) {
    setTemplates((prev) =>
      prev.map((tmpl) =>
        tmpl.id === id ? { ...tmpl, isFavorite: !tmpl.isFavorite } : tmpl
      )
    )
  }

  function getClientName(clientId: string | null): string | undefined {
    if (!clientId) return undefined
    return mockClients.find((c) => c.id === clientId)?.name
  }

  function getTypeBadgeColor(type: TimeEntryType): string {
    const colorMap: Record<string, string> = {
      BILLABLE: 'bg-billable/10 text-billable',
      NON_BILLABLE: 'bg-[var(--color-non-billable)]/10 text-[var(--color-non-billable)]',
      PRO_BONO: 'bg-[var(--color-pro-bono)]/10 text-[var(--color-pro-bono)]',
      INDIRECT_ADMIN: 'bg-[var(--color-indirect-admin)]/10 text-[var(--color-indirect-admin)]',
      INDIRECT_SALES: 'bg-[var(--color-indirect-sales)]/10 text-[var(--color-indirect-sales)]',
      INDIRECT_TRAVEL: 'bg-[var(--color-indirect-travel)]/10 text-[var(--color-indirect-travel)]',
      INDIRECT_LEARNING: 'bg-[var(--color-indirect-learning)]/10 text-[var(--color-indirect-learning)]',
      INDIRECT_OTHER: 'bg-[var(--color-indirect-other)]/10 text-[var(--color-indirect-other)]',
    }
    return colorMap[type] ?? ''
  }

  const selectedColor = form.watch('color')
  const selectedClientId = form.watch('clientId')
  const clientProjects = selectedClientId
    ? mockProjects.filter((p) => p.clientId === selectedClientId)
    : []

  return (
    <div className="max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Button onClick={openAdd}>
          <Plus className="mr-1.5 size-4" />
          {t('add')}
        </Button>
      </div>

      {/* Templates grid */}
      {templates.length === 0 ? (
        <Card className="p-6">
          <CardContent className="flex flex-col items-center justify-center p-0 py-12 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <Timer className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium">{t('empty')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t('emptyDescription')}</p>
            <Button className="mt-4" onClick={openAdd}>
              <Plus className="mr-1.5 size-4" />
              {t('add')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const clientName = getClientName(template.clientId)
            const typeLabel = typeOptions.find((o) => o.value === template.type)?.label ?? template.type

            return (
              <Card key={template.id} className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {template.color && (
                        <div
                          className="size-3 rounded-full"
                          style={{ backgroundColor: template.color }}
                        />
                      )}
                      <h3 className="text-sm font-medium">{template.name}</h3>
                    </div>
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className="text-muted-foreground hover:text-warning transition-colors"
                    >
                      <Star
                        className={`size-4 ${
                          template.isFavorite ? 'fill-warning text-warning' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {clientName && (
                    <p className="mt-1 text-xs text-muted-foreground">{clientName}</p>
                  )}

                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary" className={getTypeBadgeColor(template.type)}>
                      {typeLabel}
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">
                      {template.usageCount}x {t('usageCount').toLowerCase()}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEdit(template)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirmId(template.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(val) => {
          if (!val) {
            form.reset()
            setEditingTemplate(null)
          }
          setDialogOpen(val)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? t('edit') : t('add')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('name')}</label>
              <Input
                {...form.register('name')}
                aria-invalid={!!form.formState.errors.name}
              />
            </div>

            {/* Client */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('clientOptional')}</label>
              <Select
                value={form.watch('clientId') ?? ''}
                onValueChange={(val) => {
                  form.setValue('clientId', val ?? '')
                  form.setValue('projectId', '')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">—</SelectItem>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project (only when client selected) */}
            {clientProjects.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('projectOptional')}</label>
                <Select
                  value={form.watch('projectId') ?? ''}
                  onValueChange={(val) => form.setValue('projectId', val ?? '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">—</SelectItem>
                    {clientProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('type')}</label>
              <Select
                value={form.watch('type')}
                onValueChange={(val) => form.setValue('type', val ?? 'BILLABLE')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default duration */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('defaultDuration')}</label>
              <Input
                type="number"
                min={0}
                step={5}
                className="w-32 font-mono"
                {...form.register('defaultMins')}
              />
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('color')}</label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => form.setValue('color', color)}
                    className={`size-7 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? 'border-foreground scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setEditingTemplate(null)
                  setDialogOpen(false)
                }}
              >
                {tc('cancel')}
              </Button>
              <Button type="submit">{tc('save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tc('delete')}</DialogTitle>
            <DialogDescription>{t('deleteConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              {tc('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              {tc('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
