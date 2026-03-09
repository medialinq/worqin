import type { LeaveEntry } from './types'
import { ORG_ID, USER_ID } from './user'

export const mockLeaveEntries: LeaveEntry[] = [
  {
    id: 'leave-0000-0000-0000-000000000001',
    organizationId: ORG_ID,
    userId: USER_ID,
    date: '2025-12-25',
    type: 'VACATION',
    notes: 'Eerste kerstdag',
    createdAt: '2025-12-01T09:00:00Z',
  },
  {
    id: 'leave-0000-0000-0000-000000000002',
    organizationId: ORG_ID,
    userId: USER_ID,
    date: '2025-12-26',
    type: 'VACATION',
    notes: 'Tweede kerstdag',
    createdAt: '2025-12-01T09:00:00Z',
  },
  {
    id: 'leave-0000-0000-0000-000000000003',
    organizationId: ORG_ID,
    userId: USER_ID,
    date: '2026-01-14',
    type: 'SICK',
    notes: 'Griep',
    createdAt: '2026-01-14T08:00:00Z',
  },
  {
    id: 'leave-0000-0000-0000-000000000004',
    organizationId: ORG_ID,
    userId: USER_ID,
    date: '2026-01-01',
    type: 'PUBLIC_HOLIDAY',
    notes: 'Nieuwjaarsdag',
    createdAt: '2025-12-01T09:00:00Z',
  },
  {
    id: 'leave-0000-0000-0000-000000000005',
    organizationId: ORG_ID,
    userId: USER_ID,
    date: '2026-04-27',
    type: 'PUBLIC_HOLIDAY',
    notes: 'Koningsdag',
    createdAt: '2026-01-01T09:00:00Z',
  },
  {
    id: 'leave-0000-0000-0000-000000000006',
    organizationId: ORG_ID,
    userId: USER_ID,
    date: '2026-02-20',
    type: 'OTHER',
    notes: 'Verhuisdag',
    createdAt: '2026-02-10T09:00:00Z',
  },
]
