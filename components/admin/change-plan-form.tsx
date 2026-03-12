'use client'

import { useState, useTransition } from 'react'
import { changeOrganizationPlan } from '@/app/(admin)/admin/organizations/[id]/actions'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PLANS = ['TRIAL', 'STARTER', 'PRO', 'TEAM'] as const
type Plan = typeof PLANS[number]

const PLAN_STYLES: Record<Plan, string> = {
  TRIAL:   'border-amber-500/40 text-amber-400 data-[selected=true]:bg-amber-500/20 data-[selected=true]:border-amber-500',
  STARTER: 'border-blue-500/40 text-blue-400 data-[selected=true]:bg-blue-500/20 data-[selected=true]:border-blue-500',
  PRO:     'border-violet-500/40 text-violet-400 data-[selected=true]:bg-violet-500/20 data-[selected=true]:border-violet-500',
  TEAM:    'border-emerald-500/40 text-emerald-400 data-[selected=true]:bg-emerald-500/20 data-[selected=true]:border-emerald-500',
}

export function ChangePlanForm({
  orgId,
  currentPlan,
}: {
  orgId: string
  currentPlan: string
}) {
  const [selected, setSelected] = useState<Plan>(
    PLANS.includes(currentPlan as Plan) ? (currentPlan as Plan) : 'TRIAL'
  )
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const hasChanged = selected !== currentPlan

  function handleSubmit() {
    if (!hasChanged) return
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await changeOrganizationPlan(orgId, selected)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PLANS.map((plan) => (
          <button
            key={plan}
            onClick={() => setSelected(plan)}
            data-selected={selected === plan}
            className={cn(
              'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-200',
              PLAN_STYLES[plan]
            )}
          >
            {plan}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {success && (
        <p className="text-sm text-emerald-400">Plan bijgewerkt</p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!hasChanged || isPending}
        size="sm"
        className="bg-accent hover:bg-accent/90 text-white disabled:opacity-40"
      >
        {isPending ? 'Opslaan...' : 'Plan opslaan'}
      </Button>
    </div>
  )
}
