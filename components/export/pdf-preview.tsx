'use client'

import { useTranslations } from 'next-intl'
import { format, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'
import { BRAND } from '@/config/brand'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { mockClients, mockProjects } from '@/lib/mock/clients'
import type { TimeEntry, Expense } from '@/lib/mock/types'

interface PdfPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timeEntries: TimeEntry[]
  expenses: Expense[]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function getClientName(clientId: string | null): string {
  if (!clientId) return '-'
  const client = mockClients.find((c) => c.id === clientId)
  return client?.name ?? '-'
}

function getProjectName(projectId: string | null): string {
  if (!projectId) return '-'
  const project = mockProjects.find((p) => p.id === projectId)
  return project?.name ?? '-'
}

export function PdfPreview({
  open,
  onOpenChange,
  timeEntries,
  expenses,
}: PdfPreviewProps) {
  const t = useTranslations('export')

  const totalTimeAmount = timeEntries.reduce((sum, entry) => {
    const hours = (entry.durationBilledMins ?? entry.durationMins ?? 0) / 60
    return sum + hours * (entry.hourlyRateSnapshot ?? 0)
  }, 0)

  const totalExpenseAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  )

  const grandTotal = totalTimeAmount + totalExpenseAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('pdfPreview')}</DialogTitle>
        </DialogHeader>

        {/* PDF-style document */}
        <div className="max-h-[70vh] overflow-y-auto rounded-lg border bg-white p-8 text-black dark:bg-white dark:text-black">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{BRAND.name}</h2>
              <p className="text-sm text-gray-500">{BRAND.url}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{t('exportDate')}</p>
              <p className="font-mono text-sm tabular-nums text-gray-900">
                {format(new Date(), 'dd MMMM yyyy', { locale: nl })}
              </p>
            </div>
          </div>

          {/* Time entries table */}
          {timeEntries.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                {t('timeEntries', { count: timeEntries.length })}
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="pb-2">{t('date')}</th>
                    <th className="pb-2">{t('client')}</th>
                    <th className="pb-2">{t('project')}</th>
                    <th className="pb-2 text-right">{t('hours')}</th>
                    <th className="pb-2 text-right">{t('rate')}</th>
                    <th className="pb-2 text-right">{t('amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {timeEntries.map((entry) => {
                    const hours =
                      (entry.durationBilledMins ?? entry.durationMins ?? 0) / 60
                    const amount = hours * (entry.hourlyRateSnapshot ?? 0)
                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-gray-100"
                      >
                        <td className="py-2 font-mono tabular-nums">
                          {format(parseISO(entry.startedAt), 'dd-MM-yyyy')}
                        </td>
                        <td className="py-2">
                          {getClientName(entry.clientId)}
                        </td>
                        <td className="py-2">
                          {getProjectName(entry.projectId)}
                        </td>
                        <td className="py-2 text-right font-mono tabular-nums">
                          {hours.toFixed(1)}
                        </td>
                        <td className="py-2 text-right font-mono tabular-nums">
                          {entry.hourlyRateSnapshot
                            ? formatCurrency(entry.hourlyRateSnapshot)
                            : '-'}
                        </td>
                        <td className="py-2 text-right font-mono tabular-nums">
                          {formatCurrency(amount)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-300">
                    <td colSpan={5} className="py-2 text-right font-semibold">
                      {t('total')}
                    </td>
                    <td className="py-2 text-right font-mono font-semibold tabular-nums">
                      {formatCurrency(totalTimeAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Expenses table */}
          {expenses.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                {t('expenses', { count: expenses.length })}
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="pb-2">{t('date')}</th>
                    <th className="pb-2">{t('description')}</th>
                    <th className="pb-2 text-right">{t('amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-gray-100"
                    >
                      <td className="py-2 font-mono tabular-nums">
                        {format(parseISO(expense.date), 'dd-MM-yyyy')}
                      </td>
                      <td className="py-2">{expense.description}</td>
                      <td className="py-2 text-right font-mono tabular-nums">
                        {formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-300">
                    <td colSpan={2} className="py-2 text-right font-semibold">
                      {t('total')}
                    </td>
                    <td className="py-2 text-right font-mono font-semibold tabular-nums">
                      {formatCurrency(totalExpenseAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Grand total */}
          <div className="flex items-center justify-between border-t-2 border-gray-900 pt-3">
            <span className="text-base font-bold">{t('total')}</span>
            <span className="font-mono text-lg font-bold tabular-nums">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
