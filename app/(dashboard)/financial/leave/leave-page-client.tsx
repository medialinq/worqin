'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { CalendarOff, Plus } from 'lucide-react'
import { LeaveForm } from '@/components/financial/leave-form'
import { LeaveOverview, LeaveOverviewSkeleton } from '@/components/financial/leave-overview'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockLeaveEntries } from '@/lib/mock/leave'

export function LeavePageClient() {
  const t = useTranslations('financial.leave')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const currentYear = new Date().getFullYear()
  const isEmpty = !loading && mockLeaveEntries.length === 0

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <LeaveOverviewSkeleton />
        <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

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
      <LeaveOverview entries={mockLeaveEntries} year={currentYear} />
      <LeaveForm />
    </div>
  )
}
