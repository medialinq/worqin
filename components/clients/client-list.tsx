'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Star, ChevronRight, Plus, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientDialog } from './client-dialog'
import { toggleFavorite as toggleFavoriteAction } from '@/app/(dashboard)/customers/actions'
import type { Client, Project } from '@/lib/mock/types'

interface ClientListProps {
  clients: Client[]
  projects: Project[]
}

export function ClientList({ clients, projects }: ClientListProps) {
  const t = useTranslations('clients')
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [favorites, setFavorites] = useState<Record<string, boolean>>(
    () => Object.fromEntries(clients.map((c) => [c.id, c.isFavorite]))
  )

  const projectCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of projects) {
      counts[p.clientId] = (counts[p.clientId] || 0) + 1
    }
    return counts
  }, [projects])

  const activeClients = useMemo(() => {
    return clients
      .filter((c) => c.isActive)
      .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const aFav = favorites[a.id] ? 1 : 0
        const bFav = favorites[b.id] ? 1 : 0
        if (aFav !== bFav) return bFav - aFav
        return a.name.localeCompare(b.name)
      })
  }, [clients, search, favorites])

  const archivedClients = useMemo(() => {
    return clients
      .filter((c) => !c.isActive)
      .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  }, [clients, search])

  async function toggleFavorite(e: React.MouseEvent, clientId: string) {
    e.stopPropagation()
    const previous = favorites[clientId]
    setFavorites((prev) => ({ ...prev, [clientId]: !prev[clientId] }))

    const result = await toggleFavoriteAction({ id: clientId })
    if ('error' in result) {
      setFavorites((prev) => ({ ...prev, [clientId]: previous }))
    }
  }

  function renderClientRow(client: Client) {
    const isFav = favorites[client.id]
    const count = projectCounts[client.id] || 0

    return (
      <div
        key={client.id}
        role="button"
        tabIndex={0}
        onClick={() => router.push(`/customers/${client.id}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            router.push(`/customers/${client.id}`)
          }
        }}
        className="flex w-full cursor-pointer items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted sm:gap-4 sm:px-6"
      >
        {/* Color dot */}
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: client.color }}
        />

        {/* Favorite star */}
        <button
          onClick={(e) => toggleFavorite(e, client.id)}
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={t('favorite')}
        >
          <Star
            className={`size-4 ${isFav ? 'fill-primary text-primary' : ''}`}
          />
        </button>

        {/* Name */}
        <span className="min-w-0 flex-1 truncate font-medium">
          {client.name}
        </span>

        {/* Hourly rate */}
        {client.hourlyRate != null && (
          <span className="hidden font-mono text-sm tabular-nums text-muted-foreground sm:block">
            {t('hourlyRateShort', { rate: client.hourlyRate })}
          </span>
        )}

        {/* Project count */}
        <span className="hidden text-sm text-muted-foreground sm:block">
          {t('projectCount', { count })}
        </span>

        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </div>
    )
  }

  // Empty state
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Users className="size-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium">{t('empty.title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('empty.description')}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" data-icon="inline-start" />
          {t('empty.cta')}
        </Button>
        <ClientDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search + add button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" data-icon="inline-start" />
          {t('addClient')}
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">{t('active')}</TabsTrigger>
          <TabsTrigger value="archived">{t('archived')}</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
            {activeClients.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                {t('empty.title')}
              </div>
            ) : (
              activeClients.map(renderClientRow)
            )}
          </div>
        </TabsContent>

        <TabsContent value="archived">
          <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
            {archivedClients.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                {t('noArchived')}
              </div>
            ) : (
              archivedClients.map(renderClientRow)
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}

export function ClientListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border px-6 py-3">
            <Skeleton className="size-3 rounded-full" />
            <Skeleton className="size-4" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
