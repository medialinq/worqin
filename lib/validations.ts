import { z } from 'zod'

// ── Auth ──────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  company: z.string().min(1, 'Company name is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
})

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

// ── Onboarding ────────────────────────────────────────

export const welcomeDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company name is required'),
})

export const firstClientSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  clientEmail: z.string().email().optional().or(z.literal('')),
  clientRate: z.string().optional(),
})

export const startFirstTimerSchema = z.object({
  clientId: z.string().uuid().optional(),
})

// ── Time Entries ──────────────────────────────────────
// DB CHECK: BILLABLE, NON_BILLABLE, PRO_BONO, INDIRECT_ADMIN, INDIRECT_SALES,
//           INDIRECT_TRAVEL, INDIRECT_LEARNING, INDIRECT_OTHER

export const timeEntryTypeEnum = z.enum([
  'BILLABLE',
  'NON_BILLABLE',
  'PRO_BONO',
  'INDIRECT_ADMIN',
  'INDIRECT_SALES',
  'INDIRECT_TRAVEL',
  'INDIRECT_LEARNING',
  'INDIRECT_OTHER',
])

export const createTimeEntrySchema = z.object({
  clientId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  type: timeEntryTypeEnum,
  description: z.string().optional(),
  startedAt: z.string().datetime().optional(),
})

export const updateTimeEntrySchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  type: timeEntryTypeEnum.optional(),
  description: z.string().optional(),
  durationMins: z.number().int().min(0).optional(),
  durationBilledMins: z.number().int().min(0).optional(),
  isExportReady: z.boolean().optional(),
})

export const stopTimerSchema = z.object({
  id: z.string().uuid(),
})

export const deleteTimeEntrySchema = z.object({
  id: z.string().uuid(),
})

// ── Clients ───────────────────────────────────────────
// DB columns: name, email, color, hourly_rate, km_rate, minimum_minutes, is_active, is_favorite

export const createClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email().optional().or(z.literal('')),
  color: z.string().optional(),
  hourlyRate: z.number().min(0).nullable().optional(),
  kmRate: z.number().min(0).nullable().optional(),
  minimumMinutes: z.number().int().min(0).nullable().optional(),
})

export const updateClientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  color: z.string().optional(),
  hourlyRate: z.number().min(0).nullable().optional(),
  kmRate: z.number().min(0).nullable().optional(),
  minimumMinutes: z.number().int().min(0).nullable().optional(),
  isActive: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
})

export const archiveClientSchema = z.object({
  id: z.string().uuid(),
})

// ── Projects ──────────────────────────────────────────
// DB columns: client_id, name, description, budget_hours, hourly_rate, color, is_active

export const createProjectSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  budgetHours: z.number().min(0).nullable().optional(),
  hourlyRate: z.number().min(0).nullable().optional(),
  color: z.string().optional(),
})

export const updateProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  budgetHours: z.number().min(0).nullable().optional(),
  hourlyRate: z.number().min(0).nullable().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const archiveProjectSchema = z.object({
  id: z.string().uuid(),
})

// ── Expenses ──────────────────────────────────────────
// DB CHECK: type IN ('RECEIPT','MILEAGE','OTHER')

export const expenseTypeEnum = z.enum(['RECEIPT', 'MILEAGE', 'OTHER'])

export const createExpenseSchema = z.object({
  clientId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  type: expenseTypeEnum,
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0),
  vatRate: z.number().min(0).max(100).nullable().optional(),
  date: z.string(),
})

export const updateExpenseSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  type: expenseTypeEnum.optional(),
  description: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  vatRate: z.number().min(0).max(100).nullable().optional(),
  date: z.string().optional(),
  isExportReady: z.boolean().optional(),
})

export const deleteExpenseSchema = z.object({
  id: z.string().uuid(),
})

// ── Leave ─────────────────────────────────────────────
// DB CHECK: type IN ('VACATION','SICK','MATERNITY','PUBLIC_HOLIDAY','OTHER')
// DB: unique(user_id, date), notes column

export const leaveTypeEnum = z.enum([
  'VACATION',
  'SICK',
  'MATERNITY',
  'PUBLIC_HOLIDAY',
  'OTHER',
])

export const createLeaveSchema = z.object({
  date: z.string(),
  type: leaveTypeEnum,
  notes: z.string().optional(),
})

export const updateLeaveSchema = z.object({
  id: z.string().uuid(),
  date: z.string().optional(),
  type: leaveTypeEnum.optional(),
  notes: z.string().optional(),
})

export const deleteLeaveSchema = z.object({
  id: z.string().uuid(),
})

// ── Account Settings ──────────────────────────────────
// DB: rounding_interval CHECK IN ('NONE','MIN_15','MIN_30','MIN_60')

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  weeklyHourGoal: z.number().int().min(0).max(168).optional(),
  roundingInterval: z.enum(['NONE', 'MIN_15', 'MIN_30', 'MIN_60']).optional(),
})

export const updateOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
})

// ── Cashflow ──────────────────────────────────────────
// DB: monthly_fixed_expenses, tax_reserve_percentage, current_balance, safety_buffer, vat_frequency

export const updateCashflowSettingsSchema = z.object({
  currentBalance: z.number(),
  monthlyFixedExpenses: z.number().min(0),
  taxReservePercentage: z.number().int().min(0).max(100),
  safetyBuffer: z.number().min(0),
  vatFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
})

// ── Templates ─────────────────────────────────────────

export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  clientId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  type: timeEntryTypeEnum,
  description: z.string().optional(),
})

export const updateTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  clientId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  type: timeEntryTypeEnum.optional(),
  description: z.string().optional(),
})
