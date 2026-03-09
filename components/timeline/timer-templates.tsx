'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Play, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TYPE_COLOR_MAP, typeNeedsLightText } from './type-selector'
import type { TimerTemplate, Client } from '@/lib/mock/types'

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

interface TimerTemplatesProps {
  templates: TimerTemplate[]
  clients: Client[]
}

export function TimerTemplates({ templates, clients }: TimerTemplatesProps) {
  const t = useTranslations('timer')
  const tTypes = useTranslations('timer.types')

  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(templates.filter((tmpl) => tmpl.isFavorite).map((tmpl) => tmpl.id))
  )

  // Sort: favorites first, then by usageCount desc
  const sorted = [...templates].sort((a, b) => {
    const aFav = favorites.has(a.id) ? 1 : 0
    const bFav = favorites.has(b.id) ? 1 : 0
    if (aFav !== bFav) return bFav - aFav
    return b.usageCount - a.usageCount
  })

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (sorted.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        {t('templates.empty')}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">{t('templates.title')}</h3>
      <div className="grid grid-cols-2 gap-2">
        {sorted.map((tmpl) => {
          const client = clients.find((c) => c.id === tmpl.clientId)
          const typeKey = TYPE_LABELS[tmpl.type] ?? 'other'
          const isFav = favorites.has(tmpl.id)

          return (
            <Card key={tmpl.id} size="sm" className="rounded-xl border-0 ring-1 ring-foreground/10">
              <CardContent className="flex flex-col gap-2 p-3">
                <div className="flex items-start justify-between gap-1">
                  <span className="text-sm font-semibold leading-tight">
                    {tmpl.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(tmpl.id)}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-yellow-500"
                    aria-label={t('templates.favorite')}
                  >
                    <Star
                      className={`size-3.5 ${isFav ? 'fill-yellow-500 text-yellow-500' : ''}`}
                    />
                  </button>
                </div>

                {client && (
                  <span className="text-xs text-muted-foreground">
                    {client.name}
                  </span>
                )}

                <span
                  className="inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: TYPE_COLOR_MAP[tmpl.type],
                    color: typeNeedsLightText(tmpl.type) ? '#FFFFFF' : '#1C1C1A',
                  }}
                >
                  {tTypes(typeKey)}
                </span>

                <Button size="xs" className="mt-auto w-full gap-1">
                  <Play className="size-3" data-icon="inline-start" />
                  {t('templates.start')}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
