'use client'

import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { Calendar, CheckSquare, Square } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CalendarEvent, Client, Task } from '@/lib/mock/types'

interface TodayColumnProps {
  events: CalendarEvent[]
  tasks: Task[]
  clients: Client[]
}

export function TodayColumn({ events, tasks, clients }: TodayColumnProps) {
  const t = useTranslations('dashboard.today')
  const tAgenda = useTranslations('agenda')

  const todayEvents = events.filter((e) => {
    const eventDate = new Date(e.startAt)
    const now = new Date()
    return (
      eventDate.getFullYear() === now.getFullYear() &&
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getDate() === now.getDate()
    )
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Agenda section */}
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Calendar className="size-3" />
            {t('agenda')}
          </p>
          {todayEvents.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">
              {t('noEvents')}
            </p>
          ) : (
            <ul className="space-y-2">
              {todayEvents.map((event) => {
                const client = clients.find(
                  (c) => c.id === event.suggestedClientId
                )
                const isConfirmed = event.confirmedAt !== null

                return (
                  <li
                    key={event.id}
                    className={`flex items-start gap-3 rounded-lg p-2 text-sm ${
                      isConfirmed ? '' : 'bg-muted/50'
                    }`}
                  >
                    <span className="font-mono tabular-nums text-muted-foreground">
                      {format(new Date(event.startAt), 'HH:mm')}
                    </span>
                    <div className="flex-1 space-y-0.5">
                      <p className="font-medium leading-snug">{event.title}</p>
                      {client && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <span
                            className="inline-block size-2 rounded-full"
                            style={{ backgroundColor: client.color }}
                          />
                          {client.name}
                        </span>
                      )}
                    </div>
                    {!isConfirmed && (
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {tAgenda('confirm')}
                      </Badge>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Tasks section */}
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <CheckSquare className="size-3" />
            {t('tasks')}
          </p>
          {tasks.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">
              {t('noTasks')}
            </p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-start gap-3 rounded-lg p-2 text-sm"
                >
                  {task.isCompleted ? (
                    <CheckSquare className="mt-0.5 size-4 shrink-0 text-success" />
                  ) : (
                    <Square className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex-1 space-y-0.5">
                    <p
                      className={`font-medium leading-snug ${
                        task.isCompleted
                          ? 'text-muted-foreground line-through'
                          : ''
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.dueAt && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(task.dueAt), 'HH:mm')}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
