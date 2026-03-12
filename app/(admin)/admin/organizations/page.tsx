import { createAdminSupabaseClient } from '@/lib/admin/supabase'
import Link from 'next/link'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { ChevronRight } from 'lucide-react'
import { OrgFilters } from '@/components/admin/org-filters'
import { AdminShell } from '@/components/admin/admin-shell'

const PLAN_COLORS: Record<string, string> = {
  TRIAL:   'bg-amber-500/15 text-amber-400 border-amber-500/20',
  STARTER: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  PRO:     'bg-violet-500/15 text-violet-400 border-violet-500/20',
  TEAM:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
}

async function getOrganizations(search?: string, plan?: string) {
  const supabase = createAdminSupabaseClient()

  let query = supabase
    .from('organizations')
    .select('id, name, plan, created_at, trial_ends_at, slug')
    .order('created_at', { ascending: false })

  if (plan && plan !== 'ALL') {
    query = query.eq('plan', plan)
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data: orgs, error } = await query

  if (error || !orgs) return []

  const orgIds = orgs.map((o) => o.id)
  const { data: users } = await supabase
    .from('users')
    .select('organization_id')
    .in('organization_id', orgIds)

  const userCountMap: Record<string, number> = {}
  for (const u of users ?? []) {
    userCountMap[u.organization_id] = (userCountMap[u.organization_id] ?? 0) + 1
  }

  return orgs.map((org) => ({
    ...org,
    userCount: userCountMap[org.id] ?? 0,
  }))
}

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; plan?: string }>
}) {
  const params = await searchParams
  const organizations = await getOrganizations(params.search, params.plan)

  return (
    <AdminShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Organisaties</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              {organizations.length} organisatie{organizations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Filters */}
        <OrgFilters
          defaultSearch={params.search ?? ''}
          defaultPlan={params.plan ?? 'ALL'}
        />

        {/* Table */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 overflow-hidden">
          {organizations.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Geen organisaties gevonden
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Naam
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Plan
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:table-cell">
                    Aangemaakt
                  </th>
                  <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 md:table-cell">
                    Gebruikers
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {organizations.map((org) => (
                  <tr
                    key={org.id}
                    className="group hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/organizations/${org.id}`}
                        className="font-medium text-white hover:text-accent transition-colors"
                      >
                        {org.name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">{org.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${PLAN_COLORS[org.plan] ?? 'bg-slate-700 text-slate-300 border-slate-600'}`}
                      >
                        {org.plan}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 sm:table-cell">
                      {format(new Date(org.created_at), 'd MMM yyyy', { locale: nl })}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-slate-400 md:table-cell">
                      {org.userCount}
                    </td>
                    <td className="px-3 py-3">
                      <ChevronRight className="size-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
