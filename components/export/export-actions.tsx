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
import type { TimeEntry, Expense } from '@/lib/mock/types'

type ExportResult = 'success' | 'error' | null

interface ExportActionsProps {
  timeEntries: TimeEntry[]
  expenses: Expense[]
  onExportResult: (result: ExportResult) => void
}

export function ExportActions({
  timeEntries,
  expenses,
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
    setCsvNotice(true)
    setTimeout(() => setCsvNotice(false), 3000)
  }

  function handleJorttExport() {
    setConfirmOpen(false)
    // Mock: randomly succeed or partially fail
    const random = Math.random()
    if (random > 0.3) {
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
