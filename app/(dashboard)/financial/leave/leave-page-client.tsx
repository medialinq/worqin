'use client'

import { useTranslations } from 'next-intl'
import { CalendarOff } from 'lucide-react'
import { LeaveForm } from '@/components/financial/leave-form'
import { LeaveOverview } from '@/components/financial/leave-overview'
import { Card, CardContent } from '@/components/ui/card'

interface LeavePageClientProps {
  entries: {
    id: string
    organization_id: string
    user_id: string
    date: string
    type: string
    notes: string | null
    created_at: string
  }[]
}

export function LeavePageClient({ entries }: LeavePageClientProps) {
  const t = useTranslations('financial.leave')

  const currentYear = new Date().getFullYear()
  const isEmpty = entries.length === 0

  // Transform DB snake_case to camelCase for child components
  const formattedEntries = entries.map((e) => ({
    id: e.id,
    organizationId: e.organization_id,
    userId: e.user_id,
    date: e.date,
    type: e.type as 'VACATION' | 'SICK' | 'MATERNITY' | 'PUBLIC_HOLIDAY' | 'OTHER',
    notes: e.notes,
    createdAt: e.created_at,
  }))

  if (isEmpty) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <CalendarOff className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium">{t('empty.title')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('empty.description')}
            </p>
          </CardContent>
        </Card>
        <LeaveForm />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
      <LeaveOverview entries={formattedEntries} year={currentYear} />
      <LeaveForm />
    </div>
  )
}
