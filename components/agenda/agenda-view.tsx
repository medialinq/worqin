"use client"

import { WeekCalendar } from "./week-calendar"
import { AgendaEmptyState } from "./empty-state"
import type { CalendarEvent, CalendarConnection, Client } from "@/lib/mock/types"

interface AgendaViewProps {
  events: CalendarEvent[]
  connections: CalendarConnection[]
  clients: Client[]
}

export function AgendaView({ events, connections, clients }: AgendaViewProps) {
  // Empty state when no calendar is connected
  if (connections.length === 0) {
    return <AgendaEmptyState />
  }

  return (
    <WeekCalendar
      events={events}
      connections={connections}
      clients={clients}
    />
  )
}
