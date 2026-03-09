'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { mockExpenses } from '@/lib/mock/expenses'
import { ExpenseList, ExpenseListSkeleton } from '@/components/expenses/expense-list'
import { ExpenseDialog } from '@/components/expenses/expense-dialog'

export function ExpensesPageClient() {
  const t = useTranslations('expenses')
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const isEmpty = !loading && mockExpenses.length === 0

  return (
    <>
      {/* Header with add button */}
      <div className="flex items-center justify-end">
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-1.5 size-4" />
          {t('addExpense')}
        </Button>
      </div>

      {/* Content */}
      <Card className="p-4">
        {loading ? (
          <ExpenseListSkeleton />
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <Receipt className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium">{t('empty.title')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('empty.description')}
            </p>
            <Button className="mt-4" onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              {t('empty.cta')}
            </Button>
          </div>
        ) : (
          <ExpenseList expenses={mockExpenses} />
        )}
      </Card>

      {/* Add dialog */}
      <ExpenseDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </>
  )
}
