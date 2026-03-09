import type { DashboardStats } from './types'
import { mockActiveTimer } from './timer'

export const mockDashboardStats: DashboardStats = {
  weekHours: {
    current: 28,
    goal: 36,
  },
  yearProgress: {
    totalHours: 885,
    directHours: 847,
    indirectHours: 38,
    percentage: 72.2,
    remainingHours: 340,
  },
  revenueMTD: 4250,
  revenueLastMonth: 7890,
  activeTimer: mockActiveTimer,
}
