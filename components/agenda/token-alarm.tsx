"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { AlertTriangle, X } from "lucide-react"
import { Alert, AlertTitle, AlertDescription, AlertAction } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { CalendarConnection } from "@/lib/mock/types"
import { differenceInDays } from "date-fns"

interface TokenAlarmProps {
  connections: CalendarConnection[]
}

export function TokenAlarm({ connections }: TokenAlarmProps) {
  const t = useTranslations("agenda.tokenExpiry")
  const [dismissed, setDismissed] = useState<string[]>([])

  const expiringConnections = connections.filter((conn) => {
    if (!conn.tokenExpiresAt || dismissed.includes(conn.id)) return false
    const daysUntilExpiry = differenceInDays(new Date(conn.tokenExpiresAt), new Date())
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0
  })

  if (expiringConnections.length === 0) return null

  return (
    <div className="space-y-2">
      {expiringConnections.map((conn) => {
        const days = differenceInDays(new Date(conn.tokenExpiresAt!), new Date())
        const providerName = conn.provider === "GOOGLE" ? "Google Calendar" : "Outlook"

        return (
          <Alert key={conn.id} className="border-warning/50 bg-warning/5">
            <AlertTriangle className="size-4 text-warning" />
            <AlertTitle className="text-warning">{t("warning", { provider: providerName, days })}</AlertTitle>
            <AlertDescription>
              <span className="text-muted-foreground">{conn.accountEmail}</span>
            </AlertDescription>
            <AlertAction className="flex items-center gap-2">
              <Button variant="outline" size="xs">
                {t("action")}
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setDismissed((prev) => [...prev, conn.id])}
              >
                <X className="size-3" />
              </Button>
            </AlertAction>
          </Alert>
        )
      })}
    </div>
  )
}
