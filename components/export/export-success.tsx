'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ExportSuccessProps {
  count: number
  onBack: () => void
}

export function ExportSuccess({ count, onBack }: ExportSuccessProps) {
  const t = useTranslations('export')

  return (
    <Card className="rounded-xl">
      <CardContent>
        <div className="flex flex-col items-center py-8 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold">{t('success.title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('success.description', { count })}
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Button variant="outline" disabled>
              <ExternalLink className="mr-1.5 size-4" />
              {t('viewInJortt')}
            </Button>
            <Button onClick={onBack}>{t('backToOverview')}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
