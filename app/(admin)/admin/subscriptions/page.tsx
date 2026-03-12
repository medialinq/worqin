import { CreditCard } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'

export default function AdminSubscriptionsPage() {
  return (
    <AdminShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-white">Subscripties</h1>
          <p className="mt-0.5 text-sm text-slate-400">Mollie betalingen en abonnementen</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 py-20 text-center">
          <CreditCard className="mx-auto mb-3 size-8 text-slate-600" />
          <p className="text-sm text-slate-500">Binnenkort beschikbaar</p>
        </div>
      </div>
    </AdminShell>
  )
}
