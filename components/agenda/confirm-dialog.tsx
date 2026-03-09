"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import type { CalendarEvent, Client } from "@/lib/mock/types"

interface ConfirmDialogProps {
  event: CalendarEvent | null
  clients: Client[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (eventId: string, isBillable: boolean, clientId: string | null) => void
}

export function ConfirmDialog({
  event,
  clients,
  open,
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  const t = useTranslations("agenda")

  const [isBillable, setIsBillable] = useState(true)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  // Pre-fill with AI suggestion when event changes
  const effectiveClientId = selectedClientId ?? event?.suggestedClientId ?? null
  const suggestedClient = event?.suggestedClientId
    ? clients.find((c) => c.id === event.suggestedClientId)
    : null

  if (!event) return null

  const startTime = format(new Date(event.startAt), "HH:mm")
  const endTime = format(new Date(event.endAt), "HH:mm")

  const handleConfirm = () => {
    onConfirm(event.id, isBillable, effectiveClientId)
    setSelectedClientId(null)
    setIsBillable(true)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("confirmEvent")}</DialogTitle>
          <DialogDescription>{t("confirmEventDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Event info */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="font-medium">{event.title}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {startTime} – {endTime}
            </p>
            {event.location && (
              <p className="mt-1 text-xs text-muted-foreground">{event.location}</p>
            )}
          </div>

          {/* Billable / non-billable choice */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("type")}</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isBillable ? "default" : "outline"}
                size="sm"
                className="min-h-[48px] flex-1"
                onClick={() => setIsBillable(true)}
              >
                {t("billable")}
              </Button>
              <Button
                type="button"
                variant={!isBillable ? "default" : "outline"}
                size="sm"
                className="min-h-[48px] flex-1"
                onClick={() => setIsBillable(false)}
              >
                {t("nonBillable")}
              </Button>
            </div>
          </div>

          {/* Client selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("client")}</label>
            {suggestedClient && !selectedClientId && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="size-3 text-primary" />
                {t("suggestedClient", { client: suggestedClient.name })}
              </div>
            )}
            <Select
              value={effectiveClientId ?? ""}
              onValueChange={(val) => setSelectedClientId(val || null)}
            >
              <SelectTrigger className="w-full min-h-[48px]">
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
        </div>

        <DialogFooter>
          <Button
            type="button"
            className="min-h-[48px]"
            onClick={handleConfirm}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
