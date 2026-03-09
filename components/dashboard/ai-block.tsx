'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AIBlockProps {
  unconfirmedCount: number
}

export function AIBlock({ unconfirmedCount }: AIBlockProps) {
  const t = useTranslations('dashboard.ai')
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || unconfirmedCount === 0) {
    return null
  }

  return (
    <Card className="bg-primary/5">
      <CardContent className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="size-4 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">{t('title')}</p>
          <p className="text-sm text-muted-foreground">
            {t('suggestion', { count: unconfirmedCount })}
          </p>
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
