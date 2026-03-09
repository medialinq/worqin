// Mock data — centrale export
export { mockUser, mockOrganization } from './user'
export { mockClients, mockProjects } from './clients'
export { mockTimeEntries, mockActiveTimer, mockTimerTemplates } from './timer'
export { mockCalendarEvents, mockEndOfDaySummary, mockCalendarConnections } from './agenda'
export { mockExpenses } from './expenses'
export { mockDashboardStats } from './dashboard'
export { mockCashflowForecast } from './cashflow'
export { mockDBAReport } from './compliance'
export { mockLeaveEntries } from './leave'
export { mockTasks } from './tasks'

// Re-export alle types
export type {
  Plan,
  UserRole,
  RoundingInterval,
  TimeEntryType,
  ExpenseType,
  LeaveType,
  CalendarProvider,
  DBAScore,
  VATFrequency,
  ExportStatus,
  Organization,
  User,
  Client,
  Project,
  TimeEntry,
  CalendarConnection,
  CalendarEvent,
  Task,
  Expense,
  LeaveEntry,
  TimerTemplate,
  CashflowSettings,
  CashflowMonth,
  CashflowForecast,
  DBAReport,
  DashboardStats,
  EndOfDaySummary,
} from './types'
