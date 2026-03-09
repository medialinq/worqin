'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TypeSelector } from './type-selector'
import type { Client, Project, TimeEntryType } from '@/lib/mock/types'

interface BackfillDialogProps {
  clients: Client[]
  projects: Project[]
}

export function BackfillDialog({ clients, projects }: BackfillDialogProps) {
  const t = useTranslations('timer')
  const tCommon = useTranslations('common')

  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(() => {
    const now = new Date()
    return now.toISOString().split('T')[0]
  })
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [clientId, setClientId] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [type, setType] = useState<TimeEntryType>('BILLABLE')
  const [description, setDescription] = useState('')

  const isIndirect = type.startsWith('INDIRECT_')
  const filteredProjects = clientId
    ? projects.filter((p) => p.clientId === clientId)
    : []

  const favoriteClients = clients.filter((c) => c.isFavorite)
  const otherClients = clients.filter((c) => !c.isFavorite)

  function handleSubmit() {
    // Mock: just close dialog
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Clock className="size-3.5" data-icon="inline-start" />
            {t('backfill.label')}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('backfill.title')}</DialogTitle>
          <DialogDescription>{t('backfill.description')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('backfill.date')}
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('backfill.startTime')}
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('backfill.endTime')}
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('type')}
            </label>
            <TypeSelector value={type} onChange={setType} />
          </div>

          {/* Client */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('client')}
              {!isIndirect && <span className="text-destructive"> *</span>}
            </label>
            <Select
              value={clientId ?? ''}
              onValueChange={(val) => {
                setClientId(val || null)
                setProjectId(null)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('client')} />
              </SelectTrigger>
              <SelectContent>
                {favoriteClients.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>★</SelectLabel>
                    {favoriteClients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span
                          className="inline-block size-2 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {otherClients.length > 0 && (
                  <SelectGroup>
                    {otherClients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span
                          className="inline-block size-2 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Project */}
          {clientId && filteredProjects.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('project')}
                {!isIndirect && <span className="text-destructive"> *</span>}
              </label>
              <Select
                value={projectId ?? ''}
                onValueChange={(val) => setProjectId(val || null)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('project')} />
                </SelectTrigger>
                <SelectContent>
                  {filteredProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('description')}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder={t('description')}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSubmit}>{tCommon('confirm')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
