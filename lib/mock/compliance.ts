import type { DBAReport } from './types'
import { CLIENT_ACME_ID, CLIENT_TECHSTART_ID, CLIENT_GEMEENTE_ID } from './clients'

export const mockDBAReport: DBAReport = {
  score: 'MEDIUM',
  largestClientPercentage: 67,
  activeClientCount: 3,
  hasIndirectHours: true,
  clientBreakdown: [
    {
      clientId: CLIENT_ACME_ID,
      clientName: 'Acme BV',
      clientColor: '#3D52D5',
      percentage: 67,
      hours: 568,
    },
    {
      clientId: CLIENT_TECHSTART_ID,
      clientName: 'TechStart B.V.',
      clientColor: '#22C55E',
      percentage: 22,
      hours: 187,
    },
    {
      clientId: CLIENT_GEMEENTE_ID,
      clientName: 'Gemeente Amsterdam',
      clientColor: '#F59E0B',
      percentage: 11,
      hours: 93,
    },
  ],
  warnings: ['Meer dan 50% van je uren gaat naar \u00e9\u00e9n opdrachtgever'],
  periodDays: 90,
}
