"use client"

import { useTranslations } from "next-intl"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

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
        <Button className="min-h-[48px] gap-2">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" />
          </svg>
          {t("connect.google")}
        </Button>
        <Button variant="outline" className="min-h-[48px] gap-2">
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
            <path d="M2 3h9v9H2V3zm11 0h9v9h-9V3zM2 14h9v9H2v-9zm11 0h9v9h-9v-9z" />
          </svg>
          {t("connect.outlook")}
        </Button>
      </div>
    </div>
  )
}
