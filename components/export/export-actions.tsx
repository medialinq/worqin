'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FileText, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PdfPreview } from './pdf-preview'
import { markAsExported } from '@/app/(dashboard)/export/actions'
import type { TimeEntry, Expense } from '@/lib/mock/types'

type ExportResult = 'success' | 'error' | null

interface ExportActionsProps {
  timeEntries: TimeEntry[]
  expenses: Expense[]
  clients: { id: string; name: string }[]
  projects: { id: string; name: string; clientId: string }[]
  onExportResult: (result: ExportResult) => void
}

export function ExportActions({
  timeEntries,
  expenses,
  clients,
  projects,
  onExportResult,
}: ExportActionsProps) {
  const t = useTranslations('export')
  const tCommon = useTranslations('common')
  const [pdfOpen, setPdfOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [csvNotice, setCsvNotice] = useState(false)

  const totalItems = timeEntries.length + expenses.length
  const hasItems = totalItems > 0

  function handleCsvDownload() {
    const rows: string[] = []
    rows.push(['Type', 'Datum', 'Omschrijving', 'Klant', 'Project', 'Uren', 'Tarief', 'Bedrag', 'BTW%'].join(';'))

    for (const entry of timeEntries) {
      const client = clients.find((c) => c.id === entry.clientId)
      const project = projects.find((p) => p.id === entry.projectId)
      const hours = entry.durationBilledMins != null
        ? Math.round((entry.durationBilledMins / 60) * 100) / 100
        : entry.durationMins != null
          ? Math.round((entry.durationMins / 60) * 100) / 100
          : 0
      const rate = entry.hourlyRateSnapshot ?? 0
      const amount = Math.round(hours * rate * 100) / 100
      rows.push([
        entry.type,
        entry.startedAt.split('T')[0],
        `"${(entry.description ?? '').replace(/"/g, '""')}"`,
        client?.name ?? '',
        project?.name ?? '',
        hours.toString().replace('.', ','),
        rate.toString().replace('.', ','),
        amount.toString().replace('.', ','),
        '',
      ].join(';'))
    }

    for (const expense of expenses) {
      const client = clients.find((c) => c.id === expense.clientId)
      rows.push([
        `Onkosten-${expense.type}`,
        expense.date,
        `"${expense.description.replace(/"/g, '""')}"`,
        client?.name ?? '',
        '',
        '',
        '',
        expense.amount.toString().replace('.', ','),
        (expense.vatRate ?? 0).toString().replace('.', ','),
      ].join(';'))
    }

    const csv = rows.join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `worqin-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setCsvNotice(true)
    setTimeout(() => setCsvNotice(false), 3000)
  }

  async function handleJorttExport() {
    setConfirmOpen(false)
    const result = await markAsExported({
      timeEntryIds: timeEntries.map((e) => e.id),
      expenseIds: expenses.map((e) => e.id),
    })
    if ('success' in result) {
      onExportResult('success')
    } else {
      onExportResult('error')
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          disabled={!hasItems}
          onClick={() => setPdfOpen(true)}
        >
          <FileText className="mr-1.5 size-4" />
          {t('pdfPreview')}
        </Button>

        <div className="relative">
          <Button
            variant="secondary"
            disabled={!hasItems}
            onClick={handleCsvDownload}
          >
            <Download className="mr-1.5 size-4" />
            {t('csvDownload')}
          </Button>
          {csvNotice && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md">
              {t('csvDownloaded')}
            </div>
          )}
        </div>

        {/* Jortt export — only shown when integration is active (mock: always show) */}
        <Button
          disabled={!hasItems}
          onClick={() => setConfirmOpen(true)}
        >
          <Upload className="mr-1.5 size-4" />
          {t('exportJortt')}
        </Button>
      </div>

      {/* PDF Preview Dialog */}
      <PdfPreview
        open={pdfOpen}
        onOpenChange={setPdfOpen}
        timeEntries={timeEntries}
        expenses={expenses}
      />

      {/* Jortt Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('exportJortt')}</DialogTitle>
            <DialogDescription>
              {t('confirmExport', { count: totalItems })}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('confirmExportDescription')}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleJorttExport}>{tCommon('confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
