import { setHours, setMinutes, addDays, startOfDay } from 'date-fns'
import type { CalendarEvent, CalendarConnection, EndOfDaySummary } from './types'
import { CLIENT_ACME_ID, CLIENT_TECHSTART_ID, CLIENT_GEMEENTE_ID } from './clients'
import { ORG_ID, USER_ID } from './user'

const today = startOfDay(new Date())
const tomorrow = addDays(today, 1)

function todayAt(hour: number, minute: number): string {
  return setMinutes(setHours(today, hour), minute).toISOString()
}

function tomorrowAt(hour: number, minute: number): string {
  return setMinutes(setHours(tomorrow, hour), minute).toISOString()
}

const CONNECTION_GOOGLE_ID = 'conn-0000-0000-0000-000000000001'
const CONNECTION_OUTLOOK_ID = 'conn-0000-0000-0000-000000000002'

// Token dat over 5 dagen verloopt
const tokenExpiryDate = addDays(today, 5)

export const mockCalendarConnections: CalendarConnection[] = [
  {
    id: CONNECTION_GOOGLE_ID,
    organizationId: ORG_ID,
    userId: USER_ID,
    provider: 'GOOGLE',
    accountEmail: 'jan@gmail.com',
    isActive: true,
    lastSyncedAt: today.toISOString(),
    tokenExpiresAt: tokenExpiryDate.toISOString(),
    createdAt: '2025-08-01T10:00:00Z',
  },
  {
    id: CONNECTION_OUTLOOK_ID,
    organizationId: ORG_ID,
    userId: USER_ID,
    provider: 'MICROSOFT',
    accountEmail: 'jan@vandenberg.nl',
    isActive: true,
    lastSyncedAt: today.toISOString(),
    tokenExpiresAt: null,
    createdAt: '2025-09-15T14:00:00Z',
  },
]

export const mockCalendarEvents: CalendarEvent[] = [
  // Vandaag
  {
    id: 'evt-today-0000-0000-000000000001',
    connectionId: CONNECTION_GOOGLE_ID,
    providerEventId: 'google_evt_001',
    title: 'Standup Acme team',
    startAt: todayAt(9, 0),
    endAt: todayAt(10, 0),
    location: 'Google Meet',
    isRecurring: true,
    isBillable: true,
    suggestedClientId: CLIENT_ACME_ID,
    confirmedAt: todayAt(10, 5),
  },
  {
    id: 'evt-today-0000-0000-000000000002',
    connectionId: CONNECTION_GOOGLE_ID,
    providerEventId: 'google_evt_002',
    title: 'Workshop TechStart',
    startAt: todayAt(11, 0),
    endAt: todayAt(12, 30),
    location: 'TechStart kantoor, Herengracht 100, Amsterdam',
    isRecurring: false,
    isBillable: true,
    suggestedClientId: CLIENT_TECHSTART_ID,
    confirmedAt: todayAt(12, 35),
  },
  {
    id: 'evt-today-0000-0000-000000000003',
    connectionId: CONNECTION_GOOGLE_ID,
    providerEventId: 'google_evt_003',
    title: 'Belastingadviseur',
    startAt: todayAt(14, 0),
    endAt: todayAt(15, 0),
    location: 'Kantoor De Vries & Partners',
    isRecurring: false,
    isBillable: null,
    suggestedClientId: null,
    confirmedAt: null, // Onbevestigd
  },
  {
    id: 'evt-today-0000-0000-000000000004',
    connectionId: CONNECTION_GOOGLE_ID,
    providerEventId: 'google_evt_004',
    title: 'Check-in Gemeente project',
    startAt: todayAt(16, 0),
    endAt: todayAt(16, 30),
    location: 'Microsoft Teams',
    isRecurring: false,
    isBillable: null,
    suggestedClientId: CLIENT_GEMEENTE_ID,
    confirmedAt: null, // Onbevestigd
  },
  // Morgen
  {
    id: 'evt-tomorrow-0000-0000-000000000005',
    connectionId: CONNECTION_GOOGLE_ID,
    providerEventId: 'google_evt_005',
    title: 'Sprint planning Acme',
    startAt: tomorrowAt(9, 30),
    endAt: tomorrowAt(11, 0),
    location: 'Google Meet',
    isRecurring: false,
    isBillable: null,
    suggestedClientId: CLIENT_ACME_ID,
    confirmedAt: null,
  },
  {
    id: 'evt-tomorrow-0000-0000-000000000006',
    connectionId: CONNECTION_GOOGLE_ID,
    providerEventId: 'google_evt_006',
    title: 'Lunch netwerkevent',
    startAt: tomorrowAt(13, 0),
    endAt: tomorrowAt(14, 0),
    location: 'Restaurant De Kas, Amsterdam',
    isRecurring: false,
    isBillable: null,
    suggestedClientId: null,
    confirmedAt: null,
  },
]

// Einde-van-de-dag samenvatting: de 2 onbevestigde events van vandaag
export const mockEndOfDaySummary: EndOfDaySummary = {
  events: [
    {
      ...mockCalendarEvents[2],
      suggestedClientName: undefined,
    },
    {
      ...mockCalendarEvents[3],
      suggestedClientName: 'Gemeente Amsterdam',
    },
  ],
  totalMinutes: 90, // 60 + 30 minuten
}
