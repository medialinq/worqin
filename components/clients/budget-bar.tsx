'use client'

import { useTranslations } from 'next-intl'
import { AlertTriangle } from 'lucide-react'

interface BudgetBarProps {
  used: number
  total: number | null
}

export function BudgetBar({ used, total }: BudgetBarProps) {
  const t = useTranslations('clients')

  if (total == null) {
    return (
      <p className="text-sm text-muted-foreground">{t('project.noBudget')}</p>
    )
  }

  const percentage = Math.round((used / total) * 100)
  const capped = Math.min(percentage, 100)

  let barColor = 'bg-primary'
  if (percentage >= 100) {
    barColor = 'bg-[var(--color-error)]'
  } else if (percentage >= 80) {
    barColor = 'bg-[var(--color-warning)]'
  }

  const isWarning = percentage >= 80 && percentage < 100
  const isOver = percentage >= 100

  return (
    <div className="space-y-1.5">
      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${capped}%` }}
        />
      </div>

      {/* Label */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {t('project.budgetUsed', {
            used: used.toFixed(0),
            total: total.toFixed(0),
            percentage,
          })}
        </span>
        {(isWarning || isOver) && (
          <span className="flex items-center gap-1 text-xs">
            <AlertTriangle
              className={`size-3 ${
                isOver
                  ? 'text-[var(--color-error)]'
                  : 'text-[var(--color-warning)]'
              }`}
            />
            <span
              className={
                isOver
                  ? 'text-[var(--color-error)]'
                  : 'text-[var(--color-warning)]'
              }
            >
              {isOver ? t('project.overBudget') : t('project.budgetWarning')}
            </span>
          </span>
        )}
      </div>
    </div>
  )
}
