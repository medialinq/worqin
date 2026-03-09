'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Play, Square, Sparkles, Check, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TypeSelector, TYPE_COLOR_MAP } from './type-selector'
import type { TimeEntry, Client, Project, TimeEntryType } from '@/lib/mock/types'

const TYPE_LABELS: Record<string, string> = {
  BILLABLE: 'billable',
  NON_BILLABLE: 'nonBillable',
  PRO_BONO: 'proBono',
  INDIRECT_ADMIN: 'admin',
  INDIRECT_SALES: 'sales',
  INDIRECT_TRAVEL: 'travel',
  INDIRECT_LEARNING: 'learning',
  INDIRECT_OTHER: 'other',
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface TimerPanelProps {
  activeTimer: TimeEntry | null
  clients: Client[]
  projects: Project[]
}

export function TimerPanel({ activeTimer, clients, projects }: TimerPanelProps) {
  const t = useTranslations('timer')
  const tDash = useTranslations('dashboard.timer')
  const tTypes = useTranslations('timer.types')

  // Active timer elapsed
  const calcElapsed = useCallback(() => {
    if (!activeTimer) return 0
    return Math.floor((Date.now() - new Date(activeTimer.startedAt).getTime()) / 1000)
  }, [activeTimer])

  const [elapsed, setElapsed] = useState(() => calcElapsed())
  const [showAiSuggestion, setShowAiSuggestion] = useState(false)
  const [timerStopped, setTimerStopped] = useState(false)
  const [prevTimerId, setPrevTimerId] = useState<string | null>(activeTimer?.id ?? null)

  // Reset stopped/suggestion state when the active timer changes
  if (activeTimer?.id !== prevTimerId) {
    setPrevTimerId(activeTimer?.id ?? null)
    if (activeTimer) {
      setTimerStopped(false)
      setShowAiSuggestion(false)
    }
  }

  useEffect(() => {
    if (!activeTimer) return
    const interval = setInterval(() => {
      setElapsed(calcElapsed())
    }, 1000)
    return () => clearInterval(interval)
  }, [activeTimer, calcElapsed])

  // New timer form state
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

  function handleStop() {
    setTimerStopped(true)
    setShowAiSuggestion(true)
  }

  // Render active timer
  if (activeTimer && !timerStopped) {
    const client = clients.find((c) => c.id === activeTimer.clientId)
    const project = projects.find((p) => p.id === activeTimer.projectId)
    const typeKey = TYPE_LABELS[activeTimer.type] ?? 'other'

    return (
      <Card className="rounded-xl">
        <CardContent className="flex flex-col items-center gap-4 p-6">
          <Badge
            variant="secondary"
            className="gap-1.5"
          >
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: TYPE_COLOR_MAP[activeTimer.type] }}
            />
            {tTypes(typeKey)}
          </Badge>

          <span className="font-mono tabular-nums text-4xl font-medium tracking-tight">
            {formatElapsed(elapsed)}
          </span>

          {(client || project) && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              {client && (
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span
                    className="inline-block size-2.5 rounded-full"
                    style={{ backgroundColor: client.color }}
                  />
                  {client.name}
                </span>
              )}
              {project && (
                <span className="text-muted-foreground">{project.name}</span>
              )}
            </div>
          )}

          {activeTimer.description && (
            <p className="max-w-xs text-center text-sm text-muted-foreground">
              {activeTimer.description}
            </p>
          )}

          <Button
            variant="destructive"
            onClick={handleStop}
            className="mt-2 min-h-16 min-w-16 gap-2 rounded-full px-6"
          >
            <Square className="size-5 fill-current" />
            {tDash('stop')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // AI suggestion after stopping
  if (showAiSuggestion) {
    return (
      <Card className="rounded-xl">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="text-sm font-medium">{t('ai.suggestion')}</span>
          </div>
          <p className="rounded-lg bg-muted p-3 text-sm">
            {t('ai.mockSuggestion')}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setShowAiSuggestion(false)}
            >
              <Check className="size-3.5" data-icon="inline-start" />
              {t('ai.accept')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAiSuggestion(false)}
            >
              <X className="size-3.5" data-icon="inline-start" />
              {t('ai.dismiss')}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // New timer form
  return (
    <Card className="rounded-xl">
      <CardContent className="flex flex-col gap-4 p-6">
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

        {/* Start button */}
        <Button className="mt-2 min-h-16 min-w-16 gap-2 rounded-full px-6 self-center">
          <Play className="size-5" />
          {tDash('start')}
        </Button>
      </CardContent>
    </Card>
  )
}
