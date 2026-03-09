'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { format, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'
import { ChevronDown, ChevronRight, Clock, Receipt } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockTimeEntries } from '@/lib/mock/timer'
import { mockExpenses } from '@/lib/mock/expenses'
import { mockClients, mockProjects } from '@/lib/mock/clients'
import type { TimeEntry, Expense } from '@/lib/mock/types'

interface ExportOverviewProps {
  onItemsChange: (items: { timeEntries: TimeEntry[]; expenses: Expense[] }) => void
}

function getMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = format(date, 'yyyy-MM')
    const label = format(date, 'MMMM yyyy', { locale: nl })
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) })
  }
  return options
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function getClientName(clientId: string | null): string {
  if (!clientId) return ''
  const client = mockClients.find((c) => c.id === clientId)
  return client?.name ?? ''
}

function getProjectName(projectId: string | null): string {
  if (!projectId) return ''
  const project = mockProjects.find((p) => p.id === projectId)
  return project?.name ?? ''
}

export function ExportOverview({ onItemsChange }: ExportOverviewProps) {
  const t = useTranslations('export')
  const currentMonth = format(new Date(), 'yyyy-MM')
  const [selectedPeriod, setSelectedPeriod] = useState(currentMonth)
  const [selectedClient, setSelectedClient] = useState('all')
  const [timeEntriesExpanded, setTimeEntriesExpanded] = useState(false)
  const [expensesExpanded, setExpensesExpanded] = useState(false)

  const monthOptions = useMemo(() => getMonthOptions(), [])

  const filteredTimeEntries = useMemo(() => {
    const entries = mockTimeEntries.filter((entry) => {
      if (!entry.isExportReady || entry.exportedAt) return false
      const entryMonth = format(parseISO(entry.startedAt), 'yyyy-MM')
      if (entryMonth !== selectedPeriod) return false
      if (selectedClient !== 'all' && entry.clientId !== selectedClient) return false
      return true
    })
    return entries
  }, [selectedPeriod, selectedClient])

  const filteredExpenses = useMemo(() => {
    const expenses = mockExpenses.filter((expense) => {
      if (!expense.isExportReady || expense.exportedAt) return false
      const expenseMonth = format(parseISO(expense.date), 'yyyy-MM')
      if (expenseMonth !== selectedPeriod) return false
      if (selectedClient !== 'all' && expense.clientId !== selectedClient) return false
      return true
    })
    return expenses
  }, [selectedPeriod, selectedClient])

  // Notify parent of filtered items
  useMemo(() => {
    onItemsChange({ timeEntries: filteredTimeEntries, expenses: filteredExpenses })
  }, [filteredTimeEntries, filteredExpenses, onItemsChange])

  const totalHours = filteredTimeEntries.reduce(
    (sum, entry) => sum + (entry.durationBilledMins ?? entry.durationMins ?? 0) / 60,
    0
  )

  const totalTimeAmount = filteredTimeEntries.reduce((sum, entry) => {
    const hours = (entry.durationBilledMins ?? entry.durationMins ?? 0) / 60
    return sum + hours * (entry.hourlyRateSnapshot ?? 0)
  }, 0)

  const totalExpenseAmount = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  )

  const grandTotal = totalTimeAmount + totalExpenseAmount

  const activeClients = mockClients.filter((c) => c.isActive)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            {t('periodLabel')}
          </label>
          <Select
            value={selectedPeriod}
            onValueChange={(v) => { if (v) setSelectedPeriod(v) }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            {t('clientFilter')}
          </label>
          <Select
            value={selectedClient}
            onValueChange={(v) => { if (v) setSelectedClient(v) }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allClients')}</SelectItem>
              {activeClients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items overview */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>{t('items')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Time entries row */}
          {filteredTimeEntries.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setTimeEntriesExpanded(!timeEntriesExpanded)}
                className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {timeEntriesExpanded ? (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  )}
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t('timeEntries', { count: filteredTimeEntries.length })}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm tabular-nums text-muted-foreground">
                    {t('totalHours', { hours: totalHours.toFixed(1) })}
                  </span>
                  <span className="font-mono text-sm font-medium tabular-nums">
                    {formatCurrency(totalTimeAmount)}
                  </span>
                </div>
              </button>

              {timeEntriesExpanded && (
                <div className="ml-7 mt-1 space-y-1">
                  {filteredTimeEntries.map((entry) => {
                    const hours =
                      (entry.durationBilledMins ?? entry.durationMins ?? 0) / 60
                    const amount = hours * (entry.hourlyRateSnapshot ?? 0)
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono tabular-nums">
                            {format(parseISO(entry.startedAt), 'dd MMM', {
                              locale: nl,
                            })}
                          </span>
                          <span>{getClientName(entry.clientId) || t('noClient')}</span>
                          <span className="text-muted-foreground/60">
                            {getProjectName(entry.projectId) || t('noProject')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono tabular-nums">
                            {hours.toFixed(1)}u
                          </span>
                          <span className="font-mono tabular-nums">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Expenses row */}
          {filteredExpenses.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setExpensesExpanded(!expensesExpanded)}
                className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {expensesExpanded ? (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  )}
                  <Receipt className="size-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t('expenses', { count: filteredExpenses.length })}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-medium tabular-nums">
                    {formatCurrency(totalExpenseAmount)}
                  </span>
                </div>
              </button>

              {expensesExpanded && (
                <div className="ml-7 mt-1 space-y-1">
                  {filteredExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums">
                          {format(parseISO(expense.date), 'dd MMM', { locale: nl })}
                        </span>
                        <span>{expense.description}</span>
                      </div>
                      <span className="font-mono tabular-nums">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty state inline */}
          {filteredTimeEntries.length === 0 && filteredExpenses.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t('empty.title')}
            </p>
          )}

          {/* Grand total */}
          {(filteredTimeEntries.length > 0 || filteredExpenses.length > 0) && (
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm font-medium">{t('total')}</span>
              <span className="font-mono text-base font-bold tabular-nums">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
