import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import {
  fetchCalendarEvents,
  fetchCalendarConnections,
  fetchClients,
} from "@/lib/supabase/queries"
import { PageHeading } from "@/components/layout/page-heading"
import { AgendaView } from "@/components/agenda/agenda-view"

export default async function AgendaPage() {
  const t = await getTranslations("pages")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/login")

  const [events, connections, clients] = await Promise.all([
    fetchCalendarEvents(user.id),
    fetchCalendarConnections(user.id),
    fetchClients(profile.organization_id),
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
