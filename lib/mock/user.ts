import type { Organization, User } from './types'

// Consistente IDs — gebruikt in alle mock bestanden
export const ORG_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
export const USER_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'

export const mockOrganization: Organization = {
  id: ORG_ID,
  name: 'Van den Berg Consultancy',
  slug: 'vandenberg',
  plan: 'PRO',
  trialEndsAt: null,
  mollieId: 'cst_8wmqcHMN4U',
  createdAt: '2025-06-15T10:00:00Z',
  updatedAt: '2026-02-01T08:30:00Z',
}

export const mockUser: User = {
  id: USER_ID,
  organizationId: ORG_ID,
  email: 'jan@vandenbergconsultancy.nl',
  name: 'Jan van den Berg',
  role: 'OWNER',
  avatarUrl: null,
  weeklyHourGoal: 36,
  roundingInterval: 'MIN_15',
  notifWindowStart: '08:00',
  notifWindowEnd: '18:00',
  notifIntervalMins: 30,
  notifWeekdaysOnly: true,
  notifEnabled: true,
  onboardedAt: '2025-06-15T10:30:00Z',
  createdAt: '2025-06-15T10:00:00Z',
}
