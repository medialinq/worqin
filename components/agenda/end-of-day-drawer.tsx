"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { Clock } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import type { CalendarEvent, Client } from "@/lib/mock/types"

interface EndOfDayEventState {
  eventId: string
  selected: boolean
  isBillable: boolean
  clientId: string | null
}

interface EndOfDayDrawerProps {
  events: CalendarEvent[]
  clients: Client[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (confirmed: { eventId: string; isBillable: boolean; clientId: string | null }[]) => void
}

export function EndOfDayDrawer({
  events,
  clients,
  open,
  onOpenChange,
  onConfirm,
}: EndOfDayDrawerProps) {
  const t = useTranslations("agenda")

  const [eventStates, setEventStates] = useState<EndOfDayEventState[]>(() =>
    events.map((evt) => ({
      eventId: evt.id,
      selected: true,
      isBillable: true,
      clientId: evt.suggestedClientId,
    }))
  )

  const selectedEvents = eventStates.filter((s) => s.selected)
  const totalMinutes = selectedEvents.reduce((sum, state) => {
    const evt = events.find((e) => e.id === state.eventId)
    if (!evt) return sum
    const mins = (new Date(evt.endAt).getTime() - new Date(evt.startAt).getTime()) / 60000
    return sum + mins
  }, 0)
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10

  const updateState = (eventId: string, updates: Partial<EndOfDayEventState>) => {
    setEventStates((prev) =>
      prev.map((s) => (s.eventId === eventId ? { ...s, ...updates } : s))
    )
  }

  const toggleAll = () => {
    const allSelected = eventStates.every((s) => s.selected)
    setEventStates((prev) => prev.map((s) => ({ ...s, selected: !allSelected })))
  }

  const handleConfirm = () => {
    const confirmed = eventStates
      .filter((s) => s.selected)
      .map(({ eventId, isBillable, clientId }) => ({ eventId, isBillable, clientId }))
    onConfirm(confirmed)
    onOpenChange(false)
  }

  if (events.length === 0) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("endOfDay.title")}</SheetTitle>
          <SheetDescription>{t("endOfDay.description")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-3">
          {/* Select all */}
          <label className="flex cursor-pointer items-center gap-2 py-2 min-h-[48px]">
            <input
              type="checkbox"
              checked={eventStates.every((s) => s.selected)}
              onChange={toggleAll}
              className="size-4 rounded border-border accent-primary"
            />
            <span className="text-sm font-medium">{t("endOfDay.selectAll")}</span>
          </label>

          {/* Event list */}
          {events.map((evt) => {
            const state = eventStates.find((s) => s.eventId === evt.id)
            if (!state) return null

            const startTime = format(new Date(evt.startAt), "HH:mm")
            const endTime = format(new Date(evt.endAt), "HH:mm")
            return (
              <div
                key={evt.id}
                className="rounded-lg border bg-card p-3 space-y-2"
              >
                {/* Checkbox + event info */}
                <label className="flex cursor-pointer items-start gap-2 min-h-[48px]">
                  <input
                    type="checkbox"
                    checked={state.selected}
                    onChange={() => updateState(evt.id, { selected: !state.selected })}
                    className="mt-1 size-4 rounded border-border accent-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{evt.title}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {startTime} – {endTime}
                    </p>
                  </div>
                </label>

                {state.selected && (
                  <div className="ml-6 space-y-2">
                    {/* Billable toggle */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={state.isBillable ? "default" : "outline"}
                        size="xs"
                        className="min-h-[36px]"
                        onClick={() => updateState(evt.id, { isBillable: true })}
                      >
                        {t("billable")}
                      </Button>
                      <Button
                        type="button"
                        variant={!state.isBillable ? "default" : "outline"}
                        size="xs"
                        className="min-h-[36px]"
                        onClick={() => updateState(evt.id, { isBillable: false })}
                      >
                        {t("nonBillable")}
                      </Button>
                    </div>

                    {/* Client selector */}
                    <Select
                      value={state.clientId ?? ""}
                      onValueChange={(val) =>
                        updateState(evt.id, { clientId: val || null })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("selectClient")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t("noClient")}</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <span className="flex items-center gap-2">
                              <span
                                className="size-2 shrink-0 rounded-full"
                                style={{ backgroundColor: client.color }}
                              />
                              {client.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <SheetFooter>
          <Button
            className="w-full min-h-[48px]"
            disabled={selectedEvents.length === 0}
            onClick={handleConfirm}
          >
            <Clock className="mr-2 size-4" />
            {t("endOfDay.confirmAll", { count: totalHours })}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
