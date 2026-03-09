'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Receipt, Car, CheckSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { Expense } from '@/lib/mock/types'
import { ExpenseDialog } from './expense-dialog'

const KM_RATE = 0.23

interface ExpenseListProps {
  expenses: Expense[]
  loading?: boolean
}

function getQuarter(dateStr: string): { q: number; year: number } {
  const date = new Date(dateStr)
  const month = date.getMonth()
  return { q: Math.floor(month / 3) + 1, year: date.getFullYear() }
}

function getQuarterKey(q: number, year: number): string {
  return `${year}-Q${q}`
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function getKmFromAmount(amount: number): number {
  return Math.round(amount / KM_RATE)
}

export function ExpenseListSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-24" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border py-3">
          <Skeleton className="size-8 rounded" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

export function ExpenseList({ expenses, loading }: ExpenseListProps) {
  const t = useTranslations('expenses')

  // Determine available quarters from data
  const availableQuarters = useMemo(() => {
    const quarters = new Map<string, { q: number; year: number }>()
    for (const exp of expenses) {
      const { q, year } = getQuarter(exp.date)
      const key = getQuarterKey(q, year)
      if (!quarters.has(key)) {
        quarters.set(key, { q, year })
      }
    }
    // Also ensure current quarter is present
    const now = new Date()
    const currentQ = Math.floor(now.getMonth() / 3) + 1
    const currentYear = now.getFullYear()
    const currentKey = getQuarterKey(currentQ, currentYear)
    if (!quarters.has(currentKey)) {
      quarters.set(currentKey, { q: currentQ, year: currentYear })
    }
    return Array.from(quarters.entries())
      .sort(([a], [b]) => b.localeCompare(a))
  }, [expenses])

  // Default to current quarter
  const now = new Date()
  const defaultQuarter = getQuarterKey(
    Math.floor(now.getMonth() / 3) + 1,
    now.getFullYear()
  )

  const [selectedQuarter, setSelectedQuarter] = useState(defaultQuarter)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // Copy expenses to local state for export-ready toggling
  const [localExpenses, setLocalExpenses] = useState(expenses)

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleExportReady(id: string) {
    setLocalExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isExportReady: !e.isExportReady } : e))
    )
  }

  function bulkMarkExportReady() {
    setLocalExpenses((prev) =>
      prev.map((e) => (selectedIds.has(e.id) ? { ...e, isExportReady: true } : e))
    )
    setSelectedIds(new Set())
  }

  // Use localExpenses for rendering
  const displayExpenses = useMemo(() => {
    return localExpenses.filter((exp) => {
      const { q, year } = getQuarter(exp.date)
      return getQuarterKey(q, year) === selectedQuarter
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [localExpenses, selectedQuarter])

  const displayTotal = useMemo(() => {
    return displayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  }, [displayExpenses])

  if (loading) {
    return <ExpenseListSkeleton />
  }

  function handleRowClick(expense: Expense) {
    setEditExpense(expense)
    setEditDialogOpen(true)
  }

  return (
    <>
      <div className="space-y-1">
        {/* Quarter selector + Total */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('quarter')}:</span>
            <Select
              value={selectedQuarter}
              onValueChange={(val) => { if (val) setSelectedQuarter(val) }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableQuarters.map(([key, { q, year }]) => (
                  <SelectItem key={key} value={key}>
                    {t('quarterLabel', { q, year })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">{t('total')}:</span>{' '}
            <span className="font-mono font-bold tabular-nums">
              {formatCurrency(displayTotal)}
            </span>
          </div>
        </div>

        {/* Bulk action */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 py-2">
            <Button size="sm" variant="outline" onClick={bulkMarkExportReady}>
              <CheckSquare className="mr-1.5 size-4" />
              {t('bulkExportReady')}
            </Button>
          </div>
        )}

        {/* Expenses list */}
        {displayExpenses.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t('noExpensesInPeriod')}
          </p>
        ) : (
          <div>
            {displayExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex cursor-pointer items-center gap-3 border-b border-border py-3 transition-colors hover:bg-muted/50"
                onClick={() => handleRowClick(expense)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleRowClick(expense)
                  }
                }}
              >
                {/* Selection checkbox */}
                <button
                  type="button"
                  className={`flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    selectedIds.has(expense.id)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-transparent'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSelect(expense.id)
                  }}
                  aria-label={`Select ${expense.description}`}
                >
                  {selectedIds.has(expense.id) && (
                    <svg
                      className="size-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Type icon */}
                <div className="flex size-8 shrink-0 items-center justify-center rounded bg-muted">
                  {expense.type === 'MILEAGE' ? (
                    <Car className="size-4 text-muted-foreground" />
                  ) : (
                    <Receipt className="size-4 text-muted-foreground" />
                  )}
                </div>

                {/* Description */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{expense.description}</p>
                  <p className="font-mono text-xs text-muted-foreground tabular-nums">
                    {expense.date}
                  </p>
                </div>

                {/* Amount / km info */}
                <div className="flex shrink-0 items-center gap-2">
                  {expense.type === 'MILEAGE' && (
                    <span className="text-xs text-muted-foreground">
                      {getKmFromAmount(expense.amount)}km
                    </span>
                  )}
                  <span className="font-mono text-sm font-medium tabular-nums">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>

                {/* VAT badge */}
                {expense.vatRate != null && (
                  <Badge variant="secondary" className="shrink-0">
                    {t('vatLabel', { rate: expense.vatRate })}
                  </Badge>
                )}

                {/* Export ready indicator */}
                <button
                  type="button"
                  className={`flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    expense.isExportReady
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-input bg-transparent'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExportReady(expense.id)
                  }}
                  aria-label={t('exportReady')}
                  title={t('exportReady')}
                >
                  {expense.isExportReady && (
                    <svg
                      className="size-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <ExpenseDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        expense={editExpense ?? undefined}
      />
    </>
  )
}
