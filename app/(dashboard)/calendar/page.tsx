import { getTranslations } from "next-intl/server"
import { getAuthContext } from "@/lib/auth"
import {
  fetchCalendarEvents,
  fetchCalendarConnections,
  fetchClients,
} from "@/lib/supabase/queries"
import { PageHeading } from "@/components/layout/page-heading"
import { AgendaView } from "@/components/agenda/agenda-view"

export default async function AgendaPage() {
  const t = await getTranslations("pages")
  const { userId, organizationId } = await getAuthContext()

  const [events, connections, clients] = await Promise.all([
    fetchCalendarEvents(userId),
    fetchCalendarConnections(userId),
    fetchClients(organizationId),
  ])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <PageHeading title={t("agenda")} />
      </div>
      <AgendaView
        events={events}
        connections={connections}
        clients={clients}
      />
    </div>
  )
}
