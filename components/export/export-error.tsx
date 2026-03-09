'use client'

import { useTranslations } from 'next-intl'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ExportErrorProps {
  failed: number
  total: number
  failedItems: { id: string; description: string }[]
  onRetry: () => void
  onBack: () => void
}

export function ExportError({
  failed,
  total,
  failedItems,
  onRetry,
  onBack,
}: ExportErrorProps) {
  const t = useTranslations('export')

  return (
    <Card className="rounded-xl">
      <CardContent>
        <div className="flex flex-col items-center py-8 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
            <AlertTriangle className="size-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold">{t('error.title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('failedItems', { failed, total })}
          </p>

          {/* Failed items list */}
          {failedItems.length > 0 && (
            <div className="mt-4 w-full max-w-sm rounded-lg border bg-muted/50 p-3">
              <ul className="space-y-1 text-left text-sm text-muted-foreground">
                {failedItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <span className="size-1.5 shrink-0 rounded-full bg-orange-500" />
                    {item.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <Button variant="outline" onClick={onBack}>
              {t('backToOverview')}
            </Button>
            <Button onClick={onRetry}>
              <RotateCcw className="mr-1.5 size-4" />
              {t('retryExport')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
