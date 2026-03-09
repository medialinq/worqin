'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Star, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientOverview } from './client-overview'
import { ClientProjects } from './client-projects'
import { ClientAnalysis } from './client-analysis'
import { ClientDialog } from './client-dialog'
import type { Client, Project, TimeEntry } from '@/lib/mock/types'

interface ClientDetailPageProps {
  client: Client
  projects: Project[]
  entries: TimeEntry[]
}

export function ClientDetailPage({
  client,
  projects,
  entries,
}: ClientDetailPageProps) {
  const t = useTranslations('clients')
  const tc = useTranslations('common')
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(client.isFavorite)
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push('/customers')}
          aria-label={tc('back')}
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: client.color }}
          />
          <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">
            {client.name}
          </h1>
        </div>

        <button
          onClick={() => setIsFavorite((prev) => !prev)}
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={t('favorite')}
        >
          <Star
            className={`size-5 ${
              isFavorite ? 'fill-primary text-primary' : ''
            }`}
          />
        </button>

        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" data-icon="inline-start" />
          {tc('edit')}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="projects">{t('projectsTab')}</TabsTrigger>
          <TabsTrigger value="analysis">{t('analysisTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ClientOverview
            client={client}
            projects={projects}
            entries={entries}
          />
        </TabsContent>

        <TabsContent value="projects">
          <ClientProjects
            client={client}
            projects={projects}
            entries={entries}
          />
        </TabsContent>

        <TabsContent value="analysis">
          <ClientAnalysis
            client={client}
            projects={projects}
            entries={entries}
          />
        </TabsContent>
      </Tabs>

      <ClientDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
      />
    </div>
  )
}

export function ClientDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-7 rounded-md" />
        <Skeleton className="h-8 w-48" />
      </div>
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}
