import { createAdminSupabaseClient } from '@/lib/admin/supabase'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ChangePlanForm } from '@/components/admin/change-plan-form'
import { AdminShell } from '@/components/admin/admin-shell'

const PLAN_COLORS: Record<string, string> = {
  TRIAL:   'bg-amber-500/15 text-amber-400 border-amber-500/20',
  STARTER: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  PRO:     'bg-violet-500/15 text-violet-400 border-violet-500/20',
  TEAM:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
}

async function getOrganizationDetail(id: string) {
  const supabase = createAdminSupabaseClient()

  const [orgResult, usersResult] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, name, slug, plan, trial_ends_at, created_at, updated_at, mollie_id')
      .eq('id', id)
      .single(),
    supabase
      .from('users')
      .select('id, name, email, role, created_at, onboarded_at')
      .eq('organization_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (orgResult.error || !orgResult.data) return null

  return {
    org: orgResult.data,
    users: usersResult.data ?? [],
  }
}

export default async function AdminOrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getOrganizationDetail(id)

  if (!data) notFound()

  const { org, users } = data

  return (
    <AdminShell>
      <div className="space-y-6 max-w-3xl">
        {/* Back link */}
        <Link
          href="/admin/organizations"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="size-4" />
          Terug naar organisaties
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">{org.name}</h1>
            <p className="mt-0.5 text-sm text-slate-400">{org.slug}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${PLAN_COLORS[org.plan] ?? 'bg-slate-700 text-slate-300 border-slate-600'}`}
          >
            {org.plan}
          </span>
        </div>

        {/* Subscription info */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Abonnement</h2>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Plan</p>
              <p className="text-white font-medium">{org.plan}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Trial eindigt</p>
              <p className="text-white">
                {org.trial_ends_at
                  ? format(new Date(org.trial_ends_at), 'd MMM yyyy', { locale: nl })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Mollie ID</p>
              <p className="font-mono text-xs text-slate-400">{org.mollie_id ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Aangemaakt</p>
              <p className="text-white">
                {format(new Date(org.created_at), 'd MMM yyyy', { locale: nl })}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Bijgewerkt</p>
              <p className="text-white">
                {format(new Date(org.updated_at), 'd MMM yyyy', { locale: nl })}
              </p>
            </div>
          </div>

          {/* Change plan */}
          <div className="border-t border-slate-700 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Plan wijzigen
            </p>
            <ChangePlanForm orgId={org.id} currentPlan={org.plan} />
          </div>
        </div>

        {/* Users */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-sm font-semibold text-white">
              Gebruikers ({users.length})
            </h2>
          </div>
          {users.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              Geen gebruikers gevonden
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Naam / E-mail
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:table-cell">
                    Rol
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 md:table-cell">
                    Aangemaakt
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 md:table-cell">
                    Onboarding
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{user.name ?? '—'}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="rounded-md bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">
                        {user.role}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                      {format(new Date(user.created_at), 'd MMM yyyy', { locale: nl })}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {user.onboarded_at ? (
                        <span className="text-emerald-400 text-xs">Voltooid</span>
                      ) : (
                        <span className="text-amber-400 text-xs">Niet voltooid</span>
                      )}
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
