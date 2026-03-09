import { subDays, format } from 'date-fns'
import type { Expense } from './types'
import { ORG_ID, USER_ID } from './user'
import { CLIENT_ACME_ID, CLIENT_GEMEENTE_ID } from './clients'

const today = new Date()

function daysAgo(days: number): string {
  return format(subDays(today, days), 'yyyy-MM-dd')
}

export const mockExpenses: Expense[] = [
  {
    id: 'exp-0000-0000-0000-000000000001',
    organizationId: ORG_ID,
    userId: USER_ID,
    clientId: null,
    projectId: null,
    type: 'RECEIPT',
    description: 'Kantoorartikelen',
    amount: 45.50,
    vatRate: 21,
    receiptUrl: '/receipts/kantoorartikelen-2026-03.pdf',
    date: daysAgo(5),
    isExportReady: true,
    exportedAt: null,
    createdAt: subDays(today, 5).toISOString(),
  },
  {
    id: 'exp-0000-0000-0000-000000000002',
    organizationId: ORG_ID,
    userId: USER_ID,
    clientId: null,
    projectId: null,
    type: 'RECEIPT',
    description: 'Software licentie Adobe',
    amount: 24.99,
    vatRate: 21,
    receiptUrl: '/receipts/adobe-2026-03.pdf',
    date: daysAgo(3),
    isExportReady: false,
    exportedAt: null,
    createdAt: subDays(today, 3).toISOString(),
  },
  {
    id: 'exp-0000-0000-0000-000000000003',
    organizationId: ORG_ID,
    userId: USER_ID,
    clientId: CLIENT_ACME_ID,
    projectId: null,
    type: 'MILEAGE',
    description: 'Amsterdam \u2192 Acme kantoor',
    amount: 10.35, // 45km * €0.23
    vatRate: null,
    receiptUrl: null,
    date: daysAgo(6),
    isExportReady: true,
    exportedAt: null,
    createdAt: subDays(today, 6).toISOString(),
  },
  {
    id: 'exp-0000-0000-0000-000000000004',
    organizationId: ORG_ID,
    userId: USER_ID,
    clientId: CLIENT_GEMEENTE_ID,
    projectId: null,
    type: 'MILEAGE',
    description: 'Gemeente Amsterdam bezoek',
    amount: 2.76, // 12km * €0.23
    vatRate: null,
    receiptUrl: null,
    date: daysAgo(2),
    isExportReady: false,
    exportedAt: null,
    createdAt: subDays(today, 2).toISOString(),
  },
  {
    id: 'exp-0000-0000-0000-000000000005',
    organizationId: ORG_ID,
    userId: USER_ID,
    clientId: null,
    projectId: null,
    type: 'RECEIPT',
    description: 'Zakelijke lunch',
    amount: 38.50,
    vatRate: 9,
    receiptUrl: '/receipts/lunch-2026-03.pdf',
    date: daysAgo(1),
    isExportReady: false,
    exportedAt: null,
    createdAt: subDays(today, 1).toISOString(),
  },
]
