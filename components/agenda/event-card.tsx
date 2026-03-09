"use client"

import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { MapPin, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { CalendarEvent, Client } from "@/lib/mock/types"

interface EventCardProps {
  event: CalendarEvent
  clients: Client[]
  onClick?: () => void
  compact?: boolean
}

export function EventCard({ event, clients, onClick, compact = false }: EventCardProps) {
  const t = useTranslations("agenda")
  const isUnconfirmed = !event.confirmedAt
  const isBillable = event.isBillable === true
  const suggestedClient = event.suggestedClientId
    ? clients.find((c) => c.id === event.suggestedClientId)
    : null

  const startTime = format(new Date(event.startAt), "HH:mm")
  const endTime = format(new Date(event.endAt), "HH:mm")

  return (
    <button
      type="button"
      onClick={isUnconfirmed ? onClick : undefined}
      className={cn(
        "w-full rounded-md px-2 py-1 text-left transition-colors",
        isUnconfirmed && "cursor-pointer border border-dashed border-muted-foreground/30 bg-muted text-muted-foreground hover:bg-muted/80",
        !isUnconfirmed && isBillable && "bg-primary/10 text-primary dark:bg-primary/15",
        !isUnconfirmed && !isBillable && "bg-secondary text-secondary-foreground",
        !compact && "space-y-1"
      )}
    >
      {/* Title */}
      <p className={cn(
        "truncate text-sm font-medium",
        isUnconfirmed && "text-muted-foreground"
      )}>
        {event.title}
      </p>

      {/* Time */}
      <p className={cn(
        "font-mono text-xs",
        isUnconfirmed ? "text-muted-foreground/70" : "opacity-75"
      )}>
        {startTime} – {endTime}
      </p>

      {/* Location */}
      {!compact && event.location && (
        <div className="flex items-center gap-1 text-xs opacity-60">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
      )}

      {/* Status badge */}
      {!compact && (
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          {isUnconfirmed ? (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {t("unconfirmed")}
            </Badge>
          ) : isBillable ? (
            <Badge variant="default" className="text-xs">
              {t("billable")}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              {t("nonBillable")}
            </Badge>
          )}
        </div>
      )}

      {/* AI client suggestion */}
      {!compact && isUnconfirmed && suggestedClient && (
        <div className="flex items-center gap-1 pt-0.5 text-xs">
          <Sparkles className="size-3 text-primary" />
          <span className="text-muted-foreground">
            {t("suggestedClient", { client: suggestedClient.name })}
          </span>
        </div>
      )}
    </button>
  )
}
