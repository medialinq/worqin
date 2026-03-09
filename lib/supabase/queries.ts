/**
 * Shared Supabase data-fetching helpers.
 *
 * Every function returns camelCase objects that match the existing
 * component prop interfaces defined in lib/mock/types.ts.
 */

import { startOfWeek, startOfMonth, startOfYear } from 'date-fns'
import { createClient } from './server'
import type {
  Client,
  Project,
  TimeEntry,
  CalendarEvent,
  CalendarConnection,
  Task,
  Expense,
  LeaveEntry,
  TimerTemplate,
  DashboardStats,
  CashflowForecast,
  CashflowSettings,
  CashflowMonth,
} from '@/lib/mock/types'

// ─── Row → camelCase mappers ────────────────────────────────────

function mapClient(r: Record<string, unknown>): Client {
  return {
    id: r.id as string,
    organizationId: r.organization_id as string,
    name: r.name as string,
    email: (r.email as string) ?? null,
    color: r.color as string,
    hourlyRate: (r.hourly_rate as number) ?? null,
    kmRate: (r.km_rate as number) ?? null,
    minimumMinutes: (r.minimum_minutes as number) ?? null,
    isActive: r.is_active as boolean,
    isFavorite: r.is_favorite as boolean,
    jorttId: (r.jortt_id as string) ?? null,
    moneybirdId: (r.moneybird_id as string) ?? null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }
}

function mapProject(r: Record<string, unknown>): Project {
  return {
    id: r.id as string,
    organizationId: r.organization_id as string,
    clientId: r.client_id as string,
    name: r.name as string,
    description: (r.description as string) ?? null,
    budgetHours: (r.budget_hours as number) ?? null,
    hourlyRate: (r.hourly_rate as number) ?? null,
    color: (r.color as string) ?? null,
    isActive: r.is_active as boolean,
    jorttProjectId: (r.jortt_project_id as string) ?? null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }
}

function mapTimeEntry(r: Record<string, unknown>): TimeEntry {
  return {
    id: r.id as string,
    organizationId: r.organization_id as string,
    userId: r.user_id as string,
    clientId: (r.client_id as string) ?? null,
    projectId: (r.project_id as string) ?? null,
    calendarEventId: (r.calendar_event_id as string) ?? null,
    startedAt: r.started_at as string,
    stoppedAt: (r.stopped_at as string) ?? null,
    durationMins: (r.duration_mins as number) ?? null,
    durationRawMins: (r.duration_raw_mins as number) ?? null,
    durationBilledMins: (r.duration_billed_mins as number) ?? null,
    description: (r.description as string) ?? null,
    type: r.type as TimeEntry['type'],
    isIndirect: r.is_indirect as boolean,
    hourlyRateSnapshot: (r.hourly_rate_snapshot as number) ?? null,
    kmRateSnapshot: (r.km_rate_snapshot as number) ?? null,
    isExportReady: r.is_export_ready as boolean,
    exportedAt: (r.exported_at as string) ?? null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }
}

function mapCalendarEvent(r: Record<string, unknown>): CalendarEvent {
  return {
    id: r.id as string,
    connectionId: r.connection_id as string,
    providerEventId: r.provider_event_id as string,
    title: r.title as string,
    startAt: r.start_at as string,
    endAt: r.end_at as string,
    location: (r.location as string) ?? null,
    isRecurring: r.is_recurring as boolean,
    isBillable: (r.is_billable as boolean) ?? null,
    suggestedClientId: (r.suggested_client_id as string) ?? null,
    confirmedAt: (r.confirmed_at as string) ?? null,
  }
}

function mapCalendarConnection(r: Record<string, unknown>): CalendarConnection {
  return {
    id: r.id as string,
    organizationId: r.organization_id as string,
    userId: r.user_id as string,
    provider: r.provider as CalendarConnection['provider'],
    accountEmail: r.account_email as string,
    isActive: r.is_active as boolean,
    lastSyncedAt: (r.last_synced_at as string) ?? null,
    tokenExpiresAt: (r.token_expires_at as string) ?? null,
    createdAt: r.created_at as string,
  }
}

function mapTask(r: Record<string, unknown>): Task {
  return {
    id: r.id as string,
    organizationId: r.organization_id as string,
    userId: r.user_id as string,
    title: r.title as string,
    dueAt: (r.due_at as string) ?? null,
    clientId: (r.client_id as string) ?? null,
    projectId: (r.project_id as string) ?? null,
    isCompleted: r.is_completed as boolean,
    calendarEventId: (r.calendar_event_id as string) ?? null,
    createdAt: r.created_at as string,
  }
}

function mapExpense(r: Record<string, unknown>): Expense {
  return {
    id: r.id as string,
    organizationId: r.organization_id as string,
    userId: r.user_id as string,
    clientId: (r.client_id as string) ?? null,
    projectId: (r.project_id as string) ?? null,
    type: r.type as Expense['type'],
    description: r.description as string,
    amount: r.amount as number,
    vatRate: (r.vat_rate as number) ?? null,
    receiptUrl: (r.receipt_url as string) ?? null,
    date: r.date as string,
    isExportReady: r.is_export_ready as boolean,
    exportedAt: (r.exported_at as string) ?? null,
    createdAt: r.created_at as string,
  }
}

function mapLeaveEntry(r: Record<string, unknown>): LeaveEntry {
  return {
    id: r.id as string,
    organizationId: r.organization_id as string,
    userId: r.user_id as string,
    date: r.date as string,
    type: r.type as LeaveEntry['type'],
    notes: (r.notes as string) ?? null,
    createdAt: r.created_at as string,
  }
}

function mapTimerTemplate(r: Record<string, unknown>): TimerTemplate {
  return {
    id: r.id as string,
    organizationId: r.organization_id as string,
    userId: r.user_id as string,
    name: r.name as string,
    clientId: (r.client_id as string) ?? null,
    projectId: (r.project_id as string) ?? null,
    description: (r.description as string) ?? null,
    type: r.type as TimerTemplate['type'],
    defaultMins: (r.default_mins as number) ?? null,
    color: (r.color as string) ?? null,
    isFavorite: r.is_favorite as boolean,
    usageCount: r.usage_count as number,
    lastUsedAt: (r.last_used_at as string) ?? null,
    createdAt: r.created_at as string,
  }
}

// ─── Query functions ────────────────────────────────────────────

export async function fetchClients(organizationId: string): Promise<Client[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('organization_id', organizationId)
    .order('is_favorite', { ascending: false })
    .order('name')
  return (data ?? []).map(mapClient)
}

export async function fetchClient(clientId: string): Promise<Client | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .maybeSingle()
  return data ? mapClient(data) : null
}

export async function fetchProjects(organizationId: string): Promise<Project[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name')
  return (data ?? []).map(mapProject)
}

export async function fetchProjectsByClient(clientId: string): Promise<Project[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .order('name')
  return (data ?? []).map(mapProject)
}

export async function fetchRecentTimeEntries(
  userId: string,
  limit = 20,
): Promise<TimeEntry[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .not('stopped_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(limit)
  return (data ?? []).map(mapTimeEntry)
}

export async function fetchTimeEntriesByClient(clientId: string): Promise<TimeEntry[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('time_entries')
    .select('*')
    .eq('client_id', clientId)
    .order('started_at', { ascending: false })
  return (data ?? []).map(mapTimeEntry)
}

export async function fetchWeekTimeEntries(userId: string): Promise<TimeEntry[]> {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const supabase = await createClient()
  const { data } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('started_at', weekStart.toISOString())
  return (data ?? []).map(mapTimeEntry)
}

export async function fetchActiveTimer(userId: string): Promise<TimeEntry | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .is('stopped_at', null)
    .maybeSingle()
  return data ? mapTimeEntry(data) : null
}

export async function fetchCalendarEvents(userId: string): Promise<CalendarEvent[]> {
  const supabase = await createClient()
  // Get user's connection IDs first
  const { data: connections } = await supabase
    .from('calendar_connections')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (!connections || connections.length === 0) return []

  const connectionIds = connections.map((c) => c.id)
  const { data } = await supabase
    .from('calendar_events')
    .select('*')
    .in('connection_id', connectionIds)
    .order('start_at')
  return (data ?? []).map(mapCalendarEvent)
}

export async function fetchCalendarConnections(userId: string): Promise<CalendarConnection[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('calendar_connections')
    .select('id, organization_id, user_id, provider, account_email, is_active, last_synced_at, token_expires_at, created_at')
    .eq('user_id', userId)
    .order('created_at')
  return (data ?? []).map(mapCalendarConnection)
}

export async function fetchTasks(userId: string): Promise<Task[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', false)
    .order('due_at', { ascending: true, nullsFirst: false })
  return (data ?? []).map(mapTask)
}

export async function fetchExpenses(userId: string): Promise<Expense[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  return (data ?? []).map(mapExpense)
}

export async function fetchLeaveEntries(userId: string): Promise<LeaveEntry[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('leave_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  return (data ?? []).map(mapLeaveEntry)
}

export async function fetchTimerTemplates(userId: string): Promise<TimerTemplate[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('timer_templates')
    .select('*')
    .eq('user_id', userId)
    .order('is_favorite', { ascending: false })
    .order('usage_count', { ascending: false })
  return (data ?? []).map(mapTimerTemplate)
}

export async function fetchDashboardStats(
  userId: string,
  weeklyHourGoal: number,
): Promise<DashboardStats> {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const monthStart = startOfMonth(now)
  const yearStart = startOfYear(now)
  const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1))
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const supabase = await createClient()

  // Parallel fetches
  const [weekRes, yearRes, monthRes, lastMonthRes, timerRes] = await Promise.all([
    // Week hours
    supabase
      .from('time_entries')
      .select('duration_mins, started_at, stopped_at')
      .eq('user_id', userId)
      .gte('started_at', weekStart.toISOString()),
    // Year hours (for 1225 criterion)
    supabase
      .from('time_entries')
      .select('duration_mins, is_indirect, type')
      .eq('user_id', userId)
      .gte('started_at', yearStart.toISOString())
      .not('stopped_at', 'is', null),
    // Month revenue
    supabase
      .from('time_entries')
      .select('duration_mins, hourly_rate_snapshot')
      .eq('user_id', userId)
      .gte('started_at', monthStart.toISOString())
      .not('stopped_at', 'is', null)
      .not('hourly_rate_snapshot', 'is', null),
    // Last month revenue
    supabase
      .from('time_entries')
      .select('duration_mins, hourly_rate_snapshot')
      .eq('user_id', userId)
      .gte('started_at', lastMonthStart.toISOString())
      .lte('started_at', lastMonthEnd.toISOString())
      .not('stopped_at', 'is', null)
      .not('hourly_rate_snapshot', 'is', null),
    // Active timer
    supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .is('stopped_at', null)
      .maybeSingle(),
  ])

  // Compute week hours
  const weekEntries = weekRes.data ?? []
  const weekMins = weekEntries.reduce((sum, e) => {
    if (e.duration_mins != null) return sum + e.duration_mins
    // Running timer: compute elapsed
    if (e.stopped_at == null) {
      const elapsed = Math.floor(
        (Date.now() - new Date(e.started_at).getTime()) / 60000,
      )
      return sum + elapsed
    }
    return sum
  }, 0)
  const weekHours = Math.round((weekMins / 60) * 10) / 10

  // Compute year progress (1225-uren criterium)
  const yearEntries = yearRes.data ?? []
  let totalMins = 0
  let directMins = 0
  let indirectMins = 0
  for (const e of yearEntries) {
    const mins = e.duration_mins ?? 0
    totalMins += mins
    if (e.is_indirect) {
      indirectMins += mins
    } else {
      directMins += mins
    }
  }
  const totalHours = Math.round((totalMins / 60) * 10) / 10
  const directHours = Math.round((directMins / 60) * 10) / 10
  const indirectHours = Math.round((indirectMins / 60) * 10) / 10
  const percentage = Math.round((totalHours / 1225) * 1000) / 10
  const remainingHours = Math.max(0, 1225 - totalHours)

  // Revenue this month
  const monthEntries = monthRes.data ?? []
  const revenueMTD = monthEntries.reduce((sum, e) => {
    const hours = (e.duration_mins ?? 0) / 60
    return sum + hours * (e.hourly_rate_snapshot ?? 0)
  }, 0)

  // Revenue last month
  const lastMonthEntries = lastMonthRes.data ?? []
  const revenueLastMonth = lastMonthEntries.reduce((sum, e) => {
    const hours = (e.duration_mins ?? 0) / 60
    return sum + hours * (e.hourly_rate_snapshot ?? 0)
  }, 0)

  const activeTimer = timerRes.data ? mapTimeEntry(timerRes.data) : null

  return {
    weekHours: { current: weekHours, goal: weeklyHourGoal },
    yearProgress: {
      totalHours,
      directHours,
      indirectHours,
      percentage,
      remainingHours,
    },
    revenueMTD: Math.round(revenueMTD),
    revenueLastMonth: Math.round(revenueLastMonth),
    activeTimer,
  }
}

export async function fetchCashflowForecast(
  organizationId: string,
): Promise<CashflowForecast> {
  const supabase = await createClient()
  const { data: settingsRow } = await supabase
    .from('cashflow_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle()

  // Default settings if none exist yet
  const settings: CashflowSettings = settingsRow
    ? {
        id: settingsRow.id,
        organizationId: settingsRow.organization_id,
        monthlyFixedExpenses: settingsRow.monthly_fixed_expenses,
        taxReservePercentage: settingsRow.tax_reserve_percentage,
        currentBalance: settingsRow.current_balance,
        safetyBuffer: settingsRow.safety_buffer,
        vatFrequency: settingsRow.vat_frequency as CashflowSettings['vatFrequency'],
        updatedAt: settingsRow.updated_at,
      }
    : {
        id: '',
        organizationId,
        monthlyFixedExpenses: 0,
        taxReservePercentage: 21,
        currentBalance: 0,
        safetyBuffer: 3000,
        vatFrequency: 'QUARTERLY',
        updatedAt: new Date().toISOString(),
      }

  // Simple 3-month forecast based on settings
  const now = new Date()
  const months: CashflowMonth[] = []
  let cumulative = settings.currentBalance

  for (let i = 0; i < 3; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`

    // Estimate revenue from recent averages (simplified: use 0 if no data)
    const expectedRevenue = 0 // Will be populated as user gets more data
    const taxReserve = Math.round(expectedRevenue * (settings.taxReservePercentage / 100))
    const vatPayment = 0 // Simplified
    const netBalance = expectedRevenue - settings.monthlyFixedExpenses - taxReserve - vatPayment
    cumulative += netBalance

    const status: CashflowMonth['status'] =
      cumulative > settings.safetyBuffer
        ? 'positive'
        : cumulative > 0
          ? 'warning'
          : 'negative'

    months.push({
      month: monthStr,
      expectedRevenue,
      fixedExpenses: settings.monthlyFixedExpenses,
      taxReserve,
      vatPayment,
      netBalance,
      cumulativeBalance: cumulative,
      status,
    })
  }

  const totalExpectedRevenue = months.reduce((s, m) => s + m.expectedRevenue, 0)
  const totalExpenses = months.reduce((s, m) => s + m.fixedExpenses, 0)

  return {
    settings,
    months,
    summary: {
      totalExpectedRevenue,
      totalExpenses,
      endBalance: cumulative,
    },
  }
}
