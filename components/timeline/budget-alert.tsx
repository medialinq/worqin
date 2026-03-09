'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import type { TimeEntry, Project, Client } from '@/lib/mock/types'

interface BudgetAlertProps {
  entries: TimeEntry[]
  projects: Project[]
  clients: Client[]
}

export function BudgetAlert({ entries, projects, clients }: BudgetAlertProps) {
  const t = useTranslations('timer')

  const warnings = useMemo(() => {
    const projectHours: Record<string, number> = {}
    for (const entry of entries) {
      if (entry.projectId && entry.durationMins != null) {
        projectHours[entry.projectId] =
          (projectHours[entry.projectId] ?? 0) + entry.durationMins / 60
      }
    }

    const result: { project: Project; client: Client | undefined; percentage: number }[] = []
    for (const project of projects) {
      if (project.budgetHours == null) continue
      const used = projectHours[project.id] ?? 0
      const pct = Math.round((used / project.budgetHours) * 100)
      if (pct >= 80) {
        const client = clients.find((c) => c.id === project.clientId)
        result.push({ project, client, percentage: pct })
      }
    }
    return result
  }, [entries, projects, clients])

  if (warnings.length === 0) return null

  return (
    <div className="space-y-2">
      {warnings.map((w) => (
        <Alert
          key={w.project.id}
          className="border-warning/30 bg-warning/5"
        >
          <AlertTriangle className="size-4 text-warning" />
          <AlertTitle>{t('budget.warning')}</AlertTitle>
          <AlertDescription>
            {w.project.name}: {w.percentage}%
            {w.client && ` (${w.client.name})`}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
