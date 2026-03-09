import { setHours, setMinutes, startOfDay, addDays } from 'date-fns'
import type { Task } from './types'
import { ORG_ID, USER_ID } from './user'
import { CLIENT_ACME_ID, CLIENT_GEMEENTE_ID, PROJECT_WEBSITE_ID, PROJECT_LOKET_ID } from './clients'

const today = startOfDay(new Date())

function todayAt(hour: number, minute: number): string {
  return setMinutes(setHours(today, hour), minute).toISOString()
}

export const mockTasks: Task[] = [
  {
    id: 'task-0000-0000-0000-000000000001',
    organizationId: ORG_ID,
    userId: USER_ID,
    title: 'Wireframes homepage afronden',
    dueAt: todayAt(17, 0),
    clientId: CLIENT_ACME_ID,
    projectId: PROJECT_WEBSITE_ID,
    isCompleted: false,
    calendarEventId: null,
    createdAt: addDays(today, -2).toISOString(),
  },
  {
    id: 'task-0000-0000-0000-000000000002',
    organizationId: ORG_ID,
    userId: USER_ID,
    title: 'Feedback verwerken digitaal loket',
    dueAt: todayAt(16, 0),
    clientId: CLIENT_GEMEENTE_ID,
    projectId: PROJECT_LOKET_ID,
    isCompleted: true,
    calendarEventId: null,
    createdAt: addDays(today, -3).toISOString(),
  },
  {
    id: 'task-0000-0000-0000-000000000003',
    organizationId: ORG_ID,
    userId: USER_ID,
    title: 'Factuur maart versturen',
    dueAt: null,
    clientId: null,
    projectId: null,
    isCompleted: false,
    calendarEventId: null,
    createdAt: addDays(today, -1).toISOString(),
  },
]
