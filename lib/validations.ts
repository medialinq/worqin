import { z } from 'zod'

// ── Auth ──────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  company: z.string().min(1, 'Company name is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
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

export const timeEntryTypeEnum = z.enum([
  'BILLABLE',
  'NON_BILLABLE',
  'INDIRECT_GENERAL',
  'INDIRECT_ACQUISITION',
  'INDIRECT_EDUCATION',
  'INDIRECT_ADMIN',
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

// ── Clients ───────────────────────────────────────────

export const createClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  hourlyRate: z.number().min(0).nullable().optional(),
  color: z.string().optional(),
  minimumMinutes: z.number().int().min(0).nullable().optional(),
})

export const updateClientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  hourlyRate: z.number().min(0).nullable().optional(),
  color: z.string().optional(),
  minimumMinutes: z.number().int().min(0).nullable().optional(),
  isActive: z.boolean().optional(),
})

// ── Projects ──────────────────────────────────────────

export const createProjectSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1, 'Project name is required'),
  budgetHours: z.number().min(0).nullable().optional(),
  budgetAmount: z.number().min(0).nullable().optional(),
  hourlyRate: z.number().min(0).nullable().optional(),
  color: z.string().optional(),
})

export const updateProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  budgetHours: z.number().min(0).nullable().optional(),
  budgetAmount: z.number().min(0).nullable().optional(),
  hourlyRate: z.number().min(0).nullable().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
})

// ── Expenses ──────────────────────────────────────────

export const expenseCategoryEnum = z.enum([
  'TRAVEL',
  'MILEAGE',
  'OFFICE',
  'SOFTWARE',
  'HARDWARE',
  'MARKETING',
  'INSURANCE',
  'EDUCATION',
  'OTHER',
])

export const createExpenseSchema = z.object({
  clientId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  category: expenseCategoryEnum,
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0),
  vatPercentage: z.number().min(0).max(100).optional(),
  date: z.string(), // DATE string
  mileageKm: z.number().min(0).optional(),
})

export const updateExpenseSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  category: expenseCategoryEnum.optional(),
  description: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  vatPercentage: z.number().min(0).max(100).optional(),
  date: z.string().optional(),
  mileageKm: z.number().min(0).optional(),
  isExportReady: z.boolean().optional(),
})

// ── Leave ─────────────────────────────────────────────

export const leaveTypeEnum = z.enum(['VACATION', 'SICK', 'PERSONAL', 'HOLIDAY'])

export const createLeaveSchema = z.object({
  date: z.string(), // DATE string
  type: leaveTypeEnum,
  hours: z.number().min(0).max(24),
  note: z.string().optional(),
})

export const updateLeaveSchema = z.object({
  id: z.string().uuid(),
  date: z.string().optional(),
  type: leaveTypeEnum.optional(),
  hours: z.number().min(0).max(24).optional(),
  note: z.string().optional(),
})

// ── Account Settings ──────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  weeklyHourGoal: z.number().min(0).max(168).optional(),
  roundingInterval: z.enum(['NONE', '5', '10', '15', '30', '60']).optional(),
})

export const updateOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  kvkNumber: z.string().optional(),
  btwNumber: z.string().optional(),
})

// ── Cashflow ──────────────────────────────────────────

export const updateCashflowSettingsSchema = z.object({
  startBalance: z.number(),
  monthlyFixedCosts: z.number().min(0),
  vatReservePercentage: z.number().min(0).max(100),
  incomeTaxPercentage: z.number().min(0).max(100),
  bufferMonths: z.number().int().min(0).max(24),
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
