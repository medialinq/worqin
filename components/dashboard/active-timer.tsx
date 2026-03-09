'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Play, Square } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { TimeEntry, Client, Project } from '@/lib/mock/types'

const TYPE_COLORS: Record<string, string> = {
  BILLABLE: 'bg-billable',
  NON_BILLABLE: 'bg-non-billable',
  PRO_BONO: 'bg-pro-bono',
  INDIRECT_ADMIN: 'bg-indirect-admin',
  INDIRECT_SALES: 'bg-indirect-sales',
  INDIRECT_TRAVEL: 'bg-indirect-travel',
  INDIRECT_LEARNING: 'bg-indirect-learning',
  INDIRECT_OTHER: 'bg-indirect-other',
}

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

interface ActiveTimerProps {
  timer: TimeEntry | null
  clients: Client[]
  projects: Project[]
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function ActiveTimer({ timer, clients, projects }: ActiveTimerProps) {
  const t = useTranslations('dashboard.timer')
  const tTypes = useTranslations('timer.types')
  const calcElapsed = useCallback(() => {
    if (!timer) return 0
    return Math.floor((Date.now() - new Date(timer.startedAt).getTime()) / 1000)
  }, [timer])

  const [elapsed, setElapsed] = useState(() => calcElapsed())

  useEffect(() => {
    if (!timer) return
    const interval = setInterval(() => {
      setElapsed(calcElapsed())
    }, 1000)
    return () => clearInterval(interval)
  }, [timer, calcElapsed])

  if (!timer) {
    return (
      <Card className="flex h-full flex-col items-center justify-center">
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground">{t('empty')}</p>
          <p className="text-sm text-muted-foreground">
            {t('startDescription')}
          </p>
          <Button size="lg" className="min-h-16 min-w-16 gap-2">
            <Play className="size-5" />
            {t('start')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const client = clients.find((c) => c.id === timer.clientId)
  const project = projects.find((p) => p.id === timer.projectId)
  const typeKey = TYPE_LABELS[timer.type] ?? 'other'

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
        <Badge variant="secondary" className="gap-1.5">
          <span
            className={`inline-block size-2 rounded-full ${TYPE_COLORS[timer.type] ?? 'bg-muted-foreground'}`}
          />
          {tTypes(typeKey)}
        </Badge>

        <span className="font-mono tabular-nums text-4xl font-medium tracking-tight">
          {formatElapsed(elapsed)}
        </span>

        {(client || project) && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            {client && (
              <span
                className="inline-flex items-center gap-1.5 font-medium"
              >
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

        {timer.description && (
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            {timer.description}
          </p>
        )}

        <Button
          variant="destructive"
          className="mt-2 min-h-16 min-w-16 gap-2 rounded-full px-6"
        >
          <Square className="size-5 fill-current" />
          {t('stop')}
        </Button>
      </CardContent>
    </Card>
  )
}
