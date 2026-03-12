import { createAdminSupabaseClient } from '@/lib/admin/supabase'
import { Building2, Users, Clock, Zap } from 'lucide-react'
import { BRAND } from '@/config/brand'
import { AdminShell } from '@/components/admin/admin-shell'

async function getDashboardStats() {
  const supabase = createAdminSupabaseClient()

  const [orgsResult, usersResult] = await Promise.all([
    supabase.from('organizations').select('id, plan, trial_ends_at'),
    supabase.from('users').select('id'),
  ])

  const orgs = orgsResult.data ?? []
  const users = usersResult.data ?? []

  const totalOrgs = orgs.length
  const totalUsers = users.length
  const trialCount = orgs.filter((o) => o.plan === 'TRIAL').length
  const starterCount = orgs.filter((o) => o.plan === 'STARTER').length
  const proCount = orgs.filter((o) => o.plan === 'PRO').length
  const teamCount = orgs.filter((o) => o.plan === 'TEAM').length

  return { totalOrgs, totalUsers, trialCount, starterCount, proCount, teamCount }
}

function KpiCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  subtitle?: string
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className="rounded-lg bg-slate-700/50 p-2.5">
          <Icon className="size-5 text-slate-300" />
        </div>
      </div>
    </div>
  )
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Overzicht van alle {BRAND.name}-organisaties
          </p>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            title="Organisaties"
            value={stats.totalOrgs}
            icon={Building2}
            subtitle="Totaal geregistreerd"
          />
          <KpiCard
            title="Gebruikers"
            value={stats.totalUsers}
            icon={Users}
            subtitle="Actieve accounts"
          />
          <KpiCard
            title="Trial"
            value={stats.trialCount}
            icon={Clock}
            subtitle="Lopende proefperiodes"
          />
          <KpiCard
            title="Betaald"
            value={stats.starterCount + stats.proCount + stats.teamCount}
            icon={Zap}
            subtitle={`Starter: ${stats.starterCount} · Pro: ${stats.proCount} · Team: ${stats.teamCount}`}
          />
        </div>

        {/* Plan breakdown */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Verdeling per plan</h2>
          <div className="space-y-3">
            {[
              { label: 'TRIAL', count: stats.trialCount, color: 'bg-amber-500' },
              { label: 'STARTER', count: stats.starterCount, color: 'bg-blue-500' },
              { label: 'PRO', count: stats.proCount, color: 'bg-violet-500' },
              { label: 'TEAM', count: stats.teamCount, color: 'bg-emerald-500' },
            ].map(({ label, count, color }) => {
              const pct = stats.totalOrgs > 0 ? (count / stats.totalOrgs) * 100 : 0
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-mono text-slate-400">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-700">
                    <div
                      className={`h-2 rounded-full transition-all ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs text-slate-300">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
