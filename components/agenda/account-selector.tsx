"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import type { CalendarConnection } from "@/lib/mock/types"

interface AccountSelectorProps {
  connections: CalendarConnection[]
  enabledAccounts: string[]
  onToggle: (connectionId: string) => void
}

const PROVIDER_COLORS: Record<string, string> = {
  GOOGLE: "bg-red-500",
  MICROSOFT: "bg-blue-500",
}

const PROVIDER_LABELS: Record<string, string> = {
  GOOGLE: "googleCalendar",
  MICROSOFT: "outlook",
} as const

export function AccountSelector({
  connections,
  enabledAccounts,
  onToggle,
}: AccountSelectorProps) {
  const t = useTranslations("agenda")

  if (connections.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">{t("accounts")}:</span>
      {connections.map((conn) => {
        const isEnabled = enabledAccounts.includes(conn.id)
        const providerKey = PROVIDER_LABELS[conn.provider] as "googleCalendar" | "outlook"

        return (
          <label
            key={conn.id}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors min-h-[48px]",
              isEnabled
                ? "border-border bg-card"
                : "border-transparent bg-muted/50 opacity-60"
            )}
          >
            <span
              className={cn("size-2 shrink-0 rounded-full", PROVIDER_COLORS[conn.provider])}
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium">{t(providerKey)}</span>
              <span className="text-xs text-muted-foreground">{conn.accountEmail}</span>
            </div>
            <Switch
              size="sm"
              checked={isEnabled}
              onCheckedChange={() => onToggle(conn.id)}
            />
          </label>
        )
      })}
    </div>
  )
}
