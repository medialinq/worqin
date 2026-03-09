'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, FolderOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BudgetBar } from './budget-bar'
import { ProjectDialog } from './project-dialog'
import type { Client, Project, TimeEntry } from '@/lib/mock/types'

interface ClientProjectsProps {
  client: Client
  projects: Project[]
  entries: TimeEntry[]
}

export function ClientProjects({ client, projects, entries }: ClientProjectsProps) {
  const t = useTranslations('clients')
  const [dialogOpen, setDialogOpen] = useState(false)

  const projectHours = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of entries) {
      if (e.projectId) {
        map[e.projectId] = (map[e.projectId] || 0) + (e.durationMins ?? 0) / 60
      }
    }
    return map
  }, [entries])

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <FolderOpen className="size-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium">{t('noProjects')}</h3>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" data-icon="inline-start" />
          {t('project.add')}
        </Button>
        <ProjectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          clientId={client.id}
          clientName={client.name}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" data-icon="inline-start" />
          {t('project.add')}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => {
          const used = projectHours[project.id] ?? 0
          return (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                {project.description && (
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <BudgetBar used={used} total={project.budgetHours} />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clientId={client.id}
        clientName={client.name}
      />
    </div>
  )
}
