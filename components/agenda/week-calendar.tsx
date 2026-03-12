"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  isSameDay,
  isToday,
  getHours,
  getMinutes,
  differenceInMinutes,
} from "date-fns"
import { nl } from "date-fns/locale"
import { ChevronLeft, ChevronRight, ListChecks } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { EventCard } from "./event-card"
import { ConfirmDialog } from "./confirm-dialog"
import { EndOfDayDrawer } from "./end-of-day-drawer"
import { TokenAlarm } from "./token-alarm"
import { AccountSelector } from "./account-selector"
import type { CalendarEvent, CalendarConnection, Client } from "@/lib/mock/types"

// Time slots from 07:00 to 22:00
const START_HOUR = 7
const END_HOUR = 22
const TOTAL_HOURS = END_HOUR - START_HOUR
const SLOT_HEIGHT = 64 // px per hour

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const

interface WeekCalendarProps {
  events: CalendarEvent[]
  connections: CalendarConnection[]
  clients: Client[]
}

export function WeekCalendar({ events: initialEvents, connections, clients }: WeekCalendarProps) {
  const t = useTranslations("agenda")
  const tDays = useTranslations("timer.dayLabels")

  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState(initialEvents)
  const [confirmEvent, setConfirmEvent] = useState<CalendarEvent | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [enabledAccounts, setEnabledAccounts] = useState<string[]>(
    connections.map((c) => c.id)
  )

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    return date
  })

  // Filter events by enabled accounts and current week
  const filteredEvents = events.filter((evt) => {
    const evtDate = new Date(evt.startAt)
    const inWeek = evtDate >= weekStart && evtDate <= weekEnd
    const accountEnabled = enabledAccounts.some((accId) => {
      const conn = connections.find((c) => c.id === accId)
      return conn && evt.connectionId === conn.id
    })
    return inWeek && accountEnabled
  })

  // Unconfirmed events for today
  const todayNow = new Date()
  const todayUnconfirmed = filteredEvents.filter(
    (evt) => !evt.confirmedAt && isSameDay(new Date(evt.startAt), todayNow)
  )

  const handlePrevWeek = () => setCurrentDate((d) => subWeeks(d, 1))
  const handleNextWeek = () => setCurrentDate((d) => addWeeks(d, 1))

  const handleEventClick = (event: CalendarEvent) => {
    if (!event.confirmedAt) {
      setConfirmEvent(event)
      setConfirmOpen(true)
    }
  }

  const handleConfirm = (eventId: string, isBillable: boolean, clientId: string | null) => {
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === eventId
          ? {
              ...evt,
              confirmedAt: new Date().toISOString(),
              isBillable,
              suggestedClientId: clientId ?? evt.suggestedClientId,
            }
          : evt
      )
    )
  }

  const handleEndOfDayConfirm = (
    confirmed: { eventId: string; isBillable: boolean; clientId: string | null }[]
  ) => {
    setEvents((prev) =>
      prev.map((evt) => {
        const match = confirmed.find((c) => c.eventId === evt.id)
        if (!match) return evt
        return {
          ...evt,
          confirmedAt: new Date().toISOString(),
          isBillable: match.isBillable,
          suggestedClientId: match.clientId ?? evt.suggestedClientId,
        }
      })
    )
  }

  const toggleAccount = (connId: string) => {
    setEnabledAccounts((prev) =>
      prev.includes(connId) ? prev.filter((id) => id !== connId) : [...prev, connId]
    )
  }

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((evt) => isSameDay(new Date(evt.startAt), day))
  }

  // Calculate event position within the grid
  const getEventStyle = (event: CalendarEvent) => {
    const start = new Date(event.startAt)
    const end = new Date(event.endAt)
    const startHour = getHours(start) + getMinutes(start) / 60
    const durationMins = differenceInMinutes(end, start)
    const durationHours = durationMins / 60

    const top = Math.max(0, (startHour - START_HOUR) * SLOT_HEIGHT)
    const height = Math.max(SLOT_HEIGHT / 2, durationHours * SLOT_HEIGHT)

    return { top, height }
  }

  const weekLabel = `${format(weekStart, "d MMM", { locale: nl })} – ${format(weekEnd, "d MMM yyyy", { locale: nl })}`

  return (
    <div className="space-y-3">
      {/* Token expiry alarm */}
      <TokenAlarm connections={connections} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevWeek}
            aria-label={t("prevWeek")}
            className="min-h-[48px] min-w-[48px]"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="min-w-[160px] text-center">
            <span className="text-sm font-medium">{t("week")}</span>
            <p className="text-xs text-muted-foreground">{weekLabel}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextWeek}
            aria-label={t("nextWeek")}
            className="min-h-[48px] min-w-[48px]"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* End-of-day trigger */}
          {todayUnconfirmed.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="min-h-[48px] gap-2"
              onClick={() => setDrawerOpen(true)}
            >
              <ListChecks className="size-4" />
              {t("endOfDay.title")}
            </Button>
          )}

          {/* Account selector */}
          <AccountSelector
            connections={connections}
            enabledAccounts={enabledAccounts}
            onToggle={toggleAccount}
          />
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto overflow-y-hidden rounded-xl border bg-card">
        <div className="min-w-[700px]">
          {/* Day header row */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
            <div className="p-2" />
            {weekDays.map((day, i) => (
              <div
                key={i}
                className={cn(
                  "border-l p-2 text-center",
                  isToday(day) && "bg-primary/5"
                )}
              >
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  {tDays(DAY_KEYS[i])}
                </span>
                <div
                  className={cn(
                    "mx-auto mt-1 flex size-7 items-center justify-center rounded-full text-sm font-semibold",
                    isToday(day) && "bg-primary text-primary-foreground"
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="relative grid grid-cols-[60px_repeat(7,1fr)]">
            {/* Time labels */}
            <div className="relative">
              {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="border-t pr-2 text-right"
                  style={{ height: i < TOTAL_HOURS ? SLOT_HEIGHT : 0 }}
                >
                  <span className="font-mono text-xs text-muted-foreground -translate-y-1/2 inline-block">
                    {String(START_HOUR + i).padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day)

              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "relative border-l",
                    isToday(day) && "bg-primary/5"
                  )}
                >
                  {/* Hour grid lines */}
                  {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-t"
                      style={{ height: i < TOTAL_HOURS ? SLOT_HEIGHT : 0 }}
                    />
                  ))}

                  {/* Events overlay */}
                  <div className="absolute inset-0">
                    {dayEvents.map((evt) => {
                      const style = getEventStyle(evt)
                      return (
                        <div
                          key={evt.id}
                          className="absolute left-0.5 right-0.5"
                          style={{
                            top: style.top,
                            height: style.height,
                          }}
                        >
                          <EventCard
                            event={evt}
                            clients={clients}
                            onClick={() => handleEventClick(evt)}
                            compact={style.height < SLOT_HEIGHT}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        event={confirmEvent}
        clients={clients}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirm}
      />

      {/* End-of-day drawer */}
      <EndOfDayDrawer
        events={todayUnconfirmed}
        clients={clients}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onConfirm={handleEndOfDayConfirm}
      />
    </div>
  )
}
