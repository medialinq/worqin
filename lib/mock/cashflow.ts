import type { CashflowForecast, CashflowSettings, CashflowMonth } from './types'
import { ORG_ID } from './user'

const mockCashflowSettings: CashflowSettings = {
  id: 'cfs-0000-0000-0000-000000000001',
  organizationId: ORG_ID,
  monthlyFixedExpenses: 1200,
  taxReservePercentage: 30,
  currentBalance: 12500,
  safetyBuffer: 5000,
  vatFrequency: 'QUARTERLY',
  updatedAt: '2026-03-01T08:00:00Z',
}

const mockCashflowMonths: CashflowMonth[] = [
  {
    month: '2026-03',
    expectedRevenue: 7500,
    fixedExpenses: 1200,
    taxReserve: 2250, // 30% van 7500
    vatPayment: 0,
    netBalance: 4050, // 7500 - 1200 - 2250
    cumulativeBalance: 15800, // 12500 (start) - 750 (lopende maand correctie) + 4050
    status: 'positive',
  },
  {
    month: '2026-04',
    expectedRevenue: 8200,
    fixedExpenses: 1200,
    taxReserve: 2460, // 30% van 8200
    vatPayment: 3200, // Q1 BTW-afdracht
    netBalance: 1340, // 8200 - 1200 - 2460 - 3200
    cumulativeBalance: 19000,
    status: 'positive',
  },
  {
    month: '2026-05',
    expectedRevenue: 6800,
    fixedExpenses: 1200,
    taxReserve: 2040, // 30% van 6800
    vatPayment: 0,
    netBalance: 3560, // 6800 - 1200 - 2040
    cumulativeBalance: 18500,
    status: 'positive',
  },
]

export const mockCashflowForecast: CashflowForecast = {
  settings: mockCashflowSettings,
  months: mockCashflowMonths,
  summary: {
    totalExpectedRevenue: 22500,
    totalExpenses: 3600, // 3 * 1200
    endBalance: 18500,
  },
}
