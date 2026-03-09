'use client'

import { useTranslations } from 'next-intl'
import { Play, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BRAND } from '@/config/brand'

export function EmptyDashboard() {
  const t = useTranslations('dashboard.empty')

  return (
    <Card className="py-16">
      <CardContent className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Clock className="size-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">
            {t('title', { brand: BRAND.name })}
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Button size="lg" className="min-h-12 gap-2">
          <Play className="size-4" />
          {t('cta')}
        </Button>
      </CardContent>
    </Card>
  )
}
