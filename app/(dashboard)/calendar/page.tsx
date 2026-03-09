import { getTranslations } from "next-intl/server"
import { PageHeading } from "@/components/layout/page-heading"
import { AgendaView } from "@/components/agenda/agenda-view"
import {
  mockCalendarEvents,
  mockCalendarConnections,
  mockClients,
} from "@/lib/mock"

export default async function AgendaPage() {
  const t = await getTranslations("pages")

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <PageHeading title={t("agenda")} />
      </div>
      <AgendaView
        events={mockCalendarEvents}
        connections={mockCalendarConnections}
        clients={mockClients}
      />
    </div>
  )
}
