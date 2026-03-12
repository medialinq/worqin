"use client"

import { useTranslations } from "next-intl"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GoogleCalendarIcon } from "@/components/icons/google-calendar-icon"
import { MicrosoftOutlookIcon } from "@/components/icons/microsoft-outlook-icon"

export function AgendaEmptyState() {
  const t = useTranslations("agenda")

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16 px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Calendar className="size-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{t("empty.title")}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {t("empty.description")}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          className="min-h-[48px] gap-2"
          onClick={() => { window.location.href = '/api/agenda/connect?provider=GOOGLE' }}
        >
          <GoogleCalendarIcon className="size-4" />
          {t("connect.google")}
        </Button>
        <Button
          variant="outline"
          className="min-h-[48px] gap-2"
          onClick={() => { window.location.href = '/api/agenda/connect?provider=MICROSOFT' }}
        >
          <MicrosoftOutlookIcon className="size-4" />
          {t("connect.outlook")}
        </Button>
      </div>
    </div>
  )
}
