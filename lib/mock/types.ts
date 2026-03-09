// Alle types voor mock data — gebaseerd op TECH.md database schema

export type Plan = 'TRIAL' | 'STARTER' | 'PRO' | 'TEAM'
export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER'
export type RoundingInterval = 'NONE' | 'MIN_15' | 'MIN_30' | 'MIN_60'

export type TimeEntryType =
  | 'BILLABLE' | 'NON_BILLABLE' | 'PRO_BONO'
  | 'INDIRECT_ADMIN' | 'INDIRECT_SALES'
  | 'INDIRECT_TRAVEL' | 'INDIRECT_LEARNING' | 'INDIRECT_OTHER'

export type ExpenseType = 'RECEIPT' | 'MILEAGE' | 'OTHER'
export type LeaveType = 'VACATION' | 'SICK' | 'MATERNITY' | 'PUBLIC_HOLIDAY' | 'OTHER'
export type CalendarProvider = 'GOOGLE' | 'MICROSOFT'
export type DBAScore = 'GOOD' | 'MEDIUM' | 'LOW'
export type VATFrequency = 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
export type ExportStatus = 'SUCCESS' | 'PARTIAL' | 'FAILED'

export interface Organization {
  id: string
  name: string
  slug: string
  plan: Plan
  trialEndsAt: string | null
  mollieId: string | null
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  organizationId: string
  email: string
  name: string
  role: UserRole
  avatarUrl: string | null
  weeklyHourGoal: number
  roundingInterval: RoundingInterval
  notifWindowStart: string
  notifWindowEnd: string
  notifIntervalMins: number
  notifWeekdaysOnly: boolean
  notifEnabled: boolean
  onboardedAt: string | null
  createdAt: string
}

export interface Client {
  id: string
  organizationId: string
  name: string
  email: string | null
  color: string
  hourlyRate: number | null
  kmRate: number | null
  minimumMinutes: number | null
  isActive: boolean
  isFavorite: boolean
  jorttId: string | null
  moneybirdId: string | null
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  organizationId: string
  clientId: string
  name: string
  description: string | null
  budgetHours: number | null
  hourlyRate: number | null
  color: string | null
  isActive: boolean
  jorttProjectId: string | null
  createdAt: string
  updatedAt: string
}

export interface TimeEntry {
  id: string
  organizationId: string
  userId: string
  clientId: string | null
  projectId: string | null
  calendarEventId: string | null
  startedAt: string
  stoppedAt: string | null
  durationMins: number | null
  durationRawMins: number | null
  durationBilledMins: number | null
  description: string | null
  type: TimeEntryType
  isIndirect: boolean
  hourlyRateSnapshot: number | null
  kmRateSnapshot: number | null
  isExportReady: boolean
  exportedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CalendarConnection {
  id: string
  organizationId: string
  userId: string
  provider: CalendarProvider
  accountEmail: string
  isActive: boolean
  lastSyncedAt: string | null
  tokenExpiresAt: string | null
  createdAt: string
}

export interface CalendarEvent {
  id: string
  connectionId: string
  providerEventId: string
  title: string
  startAt: string
  endAt: string
  location: string | null
  isRecurring: boolean
  isBillable: boolean | null
  suggestedClientId: string | null
  confirmedAt: string | null
}

export interface Task {
  id: string
  organizationId: string
  userId: string
  title: string
  dueAt: string | null
  clientId: string | null
  projectId: string | null
  isCompleted: boolean
  calendarEventId: string | null
  createdAt: string
}

export interface Expense {
  id: string
  organizationId: string
  userId: string
  clientId: string | null
  projectId: string | null
  type: ExpenseType
  description: string
  amount: number
  vatRate: number | null
  receiptUrl: string | null
  date: string
  isExportReady: boolean
  exportedAt: string | null
  createdAt: string
}

export interface LeaveEntry {
  id: string
  organizationId: string
  userId: string
  date: string // DATE format: YYYY-MM-DD
  type: LeaveType
  notes: string | null
  createdAt: string
}

export interface TimerTemplate {
  id: string
  organizationId: string
  userId: string
  name: string
  clientId: string | null
  projectId: string | null
  description: string | null
  type: TimeEntryType
  defaultMins: number | null
  color: string | null
  isFavorite: boolean
  usageCount: number
  lastUsedAt: string | null
  createdAt: string
}

export interface CashflowSettings {
  id: string
  organizationId: string
  monthlyFixedExpenses: number
  taxReservePercentage: number
  currentBalance: number
  safetyBuffer: number
  vatFrequency: VATFrequency
  updatedAt: string
}

export interface CashflowMonth {
  month: string // "2026-03"
  expectedRevenue: number
  fixedExpenses: number
  taxReserve: number
  vatPayment: number
  netBalance: number
  cumulativeBalance: number
  status: 'positive' | 'warning' | 'negative'
}

export interface CashflowForecast {
  settings: CashflowSettings
  months: CashflowMonth[]
  summary: {
    totalExpectedRevenue: number
    totalExpenses: number
    endBalance: number
  }
}

export interface DBAReport {
  score: DBAScore
  largestClientPercentage: number
  activeClientCount: number
  hasIndirectHours: boolean
  clientBreakdown: {
    clientId: string
    clientName: string
    clientColor: string
    percentage: number
    hours: number
  }[]
  warnings: string[]
  periodDays: number
}

export interface DashboardStats {
  weekHours: { current: number; goal: number }
  yearProgress: {
    totalHours: number
    directHours: number
    indirectHours: number
    percentage: number
    remainingHours: number
  }
  revenueMTD: number
  revenueLastMonth: number
  activeTimer: TimeEntry | null
}

export interface EndOfDaySummary {
  events: (CalendarEvent & { suggestedClientName?: string })[]
  totalMinutes: number
}
