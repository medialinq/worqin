'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { TimeEntryType } from '@/lib/mock/types'

const CLIENT_TYPES: { type: TimeEntryType; key: string }[] = [
  { type: 'BILLABLE', key: 'billable' },
  { type: 'NON_BILLABLE', key: 'nonBillable' },
  { type: 'PRO_BONO', key: 'proBono' },
]

const BUSINESS_TYPES: { type: TimeEntryType; key: string }[] = [
  { type: 'INDIRECT_ADMIN', key: 'admin' },
  { type: 'INDIRECT_SALES', key: 'sales' },
  { type: 'INDIRECT_TRAVEL', key: 'travel' },
  { type: 'INDIRECT_LEARNING', key: 'learning' },
  { type: 'INDIRECT_OTHER', key: 'other' },
]

export const TYPE_COLOR_MAP: Record<TimeEntryType, string> = {
  BILLABLE: 'var(--color-billable)',
  NON_BILLABLE: 'var(--color-non-billable)',
  PRO_BONO: 'var(--color-pro-bono)',
  INDIRECT_ADMIN: 'var(--color-indirect-admin)',
  INDIRECT_SALES: 'var(--color-indirect-sales)',
  INDIRECT_TRAVEL: 'var(--color-indirect-travel)',
  INDIRECT_LEARNING: 'var(--color-indirect-learning)',
  INDIRECT_OTHER: 'var(--color-indirect-other)',
}

/** Returns true if the given type needs white text on its background */
export function typeNeedsLightText(type: TimeEntryType): boolean {
  return ['BILLABLE', 'INDIRECT_SALES', 'INDIRECT_LEARNING'].includes(type)
}

interface TypeSelectorProps {
  value: TimeEntryType
  onChange: (type: TimeEntryType) => void
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  const t = useTranslations('timer.types')

  return (
    <div className="space-y-3">
      {/* Client work */}
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {t('clientWork')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {CLIENT_TYPES.map(({ type, key }) => (
            <TypeButton
              key={type}
              type={type}
              label={t(key)}
              isSelected={value === type}
              onClick={() => onChange(type)}
            />
          ))}
        </div>
      </div>

      {/* Business work */}
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {t('businessWork')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {BUSINESS_TYPES.map(({ type, key }) => (
            <TypeButton
              key={type}
              type={type}
              label={t(key)}
              isSelected={value === type}
              onClick={() => onChange(type)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function TypeButton({
  type,
  label,
  isSelected,
  onClick,
}: {
  type: TimeEntryType
  label: string
  isSelected: boolean
  onClick: () => void
}) {
  const bgColor = TYPE_COLOR_MAP[type]
  const lightText = typeNeedsLightText(type)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
        'ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected
          ? 'ring-2 ring-offset-2 ring-foreground/20'
          : 'opacity-60 hover:opacity-80'
      )}
      style={{
        backgroundColor: bgColor,
        color: lightText ? '#FFFFFF' : '#1C1C1A',
      }}
    >
      <span
        className={cn(
          'inline-block size-2 rounded-full',
          isSelected ? 'bg-white/80' : 'bg-white/40'
        )}
        style={{
          backgroundColor: isSelected
            ? lightText
              ? 'rgba(255,255,255,0.9)'
              : 'rgba(28,28,26,0.6)'
            : lightText
              ? 'rgba(255,255,255,0.5)'
              : 'rgba(28,28,26,0.3)',
        }}
      />
      {label}
    </button>
  )
}
