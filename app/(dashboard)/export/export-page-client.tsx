'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ArrowRight, FileOutput } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExportOverview } from '@/components/export/export-overview'
import { ExportActions } from '@/components/export/export-actions'
import { ExportSuccess } from '@/components/export/export-success'
import { ExportError } from '@/components/export/export-error'
import type { TimeEntry, Expense } from '@/lib/mock/types'

type ExportView = 'overview' | 'success' | 'error'

interface ExportPageClientProps {
  initialTimeEntries: Record<string, unknown>[]
  initialExpenses: Record<string, unknown>[]
  clients: { id: string; name: string; is_active: boolean }[]
  projects: { id: string; name: string; client_id: string }[]
}

// Transform DB snake_case rows to camelCase TimeEntry shape
function toTimeEntry(row: Record<string, unknown>): TimeEntry {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    userId: row.user_id as string,
    clientId: (row.client_id as string) ?? null,
    projectId: (row.project_id as string) ?? null,
    calendarEventId: (row.calendar_event_id as string) ?? null,
    startedAt: row.started_at as string,
    stoppedAt: (row.stopped_at as string) ?? null,
    durationMins: (row.duration_mins as number) ?? null,
    durationRawMins: (row.duration_raw_mins as number) ?? null,
    durationBilledMins: (row.duration_billed_mins as number) ?? null,
    description: (row.description as string) ?? null,
    type: row.type as TimeEntry['type'],
    isIndirect: row.is_indirect as boolean,
    hourlyRateSnapshot: (row.hourly_rate_snapshot as number) ?? null,
    kmRateSnapshot: (row.km_rate_snapshot as number) ?? null,
    isExportReady: row.is_export_ready as boolean,
    exportedAt: (row.exported_at as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

// Transform DB snake_case rows to camelCase Expense shape
function toExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    userId: row.user_id as string,
    clientId: (row.client_id as string) ?? null,
    projectId: (row.project_id as string) ?? null,
    type: row.type as Expense['type'],
    description: row.description as string,
    amount: row.amount as number,
    vatRate: (row.vat_rate as number) ?? null,
    receiptUrl: (row.receipt_url as string) ?? null,
    date: row.date as string,
    isExportReady: row.is_export_ready as boolean,
    exportedAt: (row.exported_at as string) ?? null,
    createdAt: row.created_at as string,
  }
}

export function ExportPageClient({
  initialTimeEntries,
  initialExpenses,
  clients,
  projects,
}: ExportPageClientProps) {
  const t = useTranslations('export')
  const router = useRouter()
  const [view, setView] = useState<ExportView>('overview')
  const [items, setItems] = useState<{
    timeEntries: TimeEntry[]
    expenses: Expense[]
  }>({ timeEntries: [], expenses: [] })

  const allTimeEntries = initialTimeEntries.map(toTimeEntry)
  const allExpenses = initialExpenses.map(toExpense)

  // Transform clients/projects for ExportOverview
  const clientsList = clients.map((c) => ({
    id: c.id,
    name: c.name,
    isActive: c.is_active,
  }))
  const projectsList = projects.map((p) => ({
    id: p.id,
    name: p.name,
    clientId: p.client_id,
  }))

  const totalItems = items.timeEntries.length + items.expenses.length
  const isEmpty = allTimeEntries.length === 0 && allExpenses.length === 0

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

  // Failed items for error view
  const failedItems = items.timeEntries.slice(0, 2).map((entry) => ({
    id: entry.id,
    description: entry.description ?? 'Unnamed entry',
  }))

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
        failed={failedItems.length}
        total={totalItems}
        failedItems={failedItems}
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
      <ExportOverview
        onItemsChange={handleItemsChange}
        timeEntries={allTimeEntries}
        expenses={allExpenses}
        clients={clientsList}
        projects={projectsList}
      />
      <ExportActions
        timeEntries={items.timeEntries}
        expenses={items.expenses}
        onExportResult={handleExportResult}
      />
    </div>
  )
}
