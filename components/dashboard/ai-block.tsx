'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AIBlockProps {
  unconfirmedCount: number
  userName: string
  weekHours: number
  weekGoal: number
  todayEvents: { title: string; startAt: string; clientName?: string }[]
  pendingTasks: { title: string; dueAt?: string | null }[]
}

export function AIBlock({
  unconfirmedCount,
  userName,
  weekHours,
  weekGoal,
  todayEvents,
  pendingTasks,
}: AIBlockProps) {
  const t = useTranslations('dashboard.ai')
  const [dismissed, setDismissed] = useState(false)
  const [briefing, setBriefing] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const hasContent = unconfirmedCount > 0 || pendingTasks.length > 0 || todayEvents.length > 0

  useEffect(() => {
    if (!hasContent) { setLoading(false); return }

    const controller = new AbortController()
    setLoading(true)

    fetch('/api/ai/briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName,
        todayEvents: todayEvents.map((e) => ({ title: e.title, startAt: e.startAt })),
        pendingTasks: pendingTasks.map((t) => ({ title: t.title, dueAt: t.dueAt ?? undefined })),
        weekHours,
        weekGoal,
        unconfirmedCount,
      }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => { if (data.briefing) setBriefing(data.briefing) })
      .catch(() => { /* silently fall back to static message */ })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (dismissed || !hasContent) return null

  return (
    <Card className="bg-primary/5">
      <CardContent className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="size-4 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">{t('title')}</p>
          {loading ? (
            <div className="space-y-1.5 pt-0.5">
              <div className="h-3.5 w-3/4 animate-pulse rounded bg-primary/10" />
              <div className="h-3.5 w-1/2 animate-pulse rounded bg-primary/10" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {briefing ?? t('suggestion', { count: unconfirmedCount })}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="shrink-0"
        >
          {t('dismiss')}
        </Button>
      </CardContent>
    </Card>
  )
}
