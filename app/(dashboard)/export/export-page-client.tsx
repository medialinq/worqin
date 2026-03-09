'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ArrowRight, FileOutput } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExportOverview } from '@/components/export/export-overview'
import { ExportActions } from '@/components/export/export-actions'
import { ExportSuccess } from '@/components/export/export-success'
import { ExportError } from '@/components/export/export-error'
import { ExportSkeleton } from '@/components/export/export-skeleton'
import type { TimeEntry, Expense } from '@/lib/mock/types'

type ExportView = 'overview' | 'success' | 'error'

export function ExportPageClient() {
  const t = useTranslations('export')
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ExportView>('overview')
  const [items, setItems] = useState<{
    timeEntries: TimeEntry[]
    expenses: Expense[]
  }>({ timeEntries: [], expenses: [] })

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const totalItems = items.timeEntries.length + items.expenses.length
  const isEmpty = !loading && totalItems === 0

  const handleItemsChange = useCallback(
    (newItems: { timeEntries: TimeEntry[]; expenses: Expense[] }) => {
      setItems(newItems)
    },
    []
  )

  function handleExportResult(result: 'success' | 'error' | null) {
    if (result === 'success') {
      setView('success')
    } else if (result === 'error') {
      setView('error')
    }
  }

  // Mock failed items for error view
  const mockFailedItems = items.timeEntries.slice(0, 2).map((entry) => ({
    id: entry.id,
    description: entry.description ?? 'Unnamed entry',
  }))

  if (loading) {
    return <ExportSkeleton />
  }

  if (view === 'success') {
    return (
      <ExportSuccess
        count={totalItems}
        onBack={() => setView('overview')}
      />
    )
  }

  if (view === 'error') {
    return (
      <ExportError
        failed={mockFailedItems.length}
        total={totalItems}
        failedItems={mockFailedItems}
        onRetry={() => handleExportResult('success')}
        onBack={() => setView('overview')}
      />
    )
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
          <FileOutput className="size-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium">{t('empty.title')}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {t('empty.description')}
        </p>
        <Button className="mt-4" onClick={() => router.push('/timeline')}>
          {t('empty.cta')}
          <ArrowRight className="ml-1.5 size-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ExportOverview onItemsChange={handleItemsChange} />
      <ExportActions
        timeEntries={items.timeEntries}
        expenses={items.expenses}
        onExportResult={handleExportResult}
      />
    </div>
  )
}
