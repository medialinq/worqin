'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANS = ['ALL', 'TRIAL', 'STARTER', 'PRO', 'TEAM'] as const

export function OrgFilters({
  defaultSearch,
  defaultPlan,
}: {
  defaultSearch: string
  defaultPlan: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(window.location.search)
    if (value && value !== 'ALL') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none" />
        <Input
          type="search"
          placeholder="Zoek organisatie..."
          defaultValue={defaultSearch}
          onChange={(e) => updateParam('search', e.target.value)}
          className="pl-9 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-accent"
        />
      </div>

      {/* Plan filter */}
      <div className="flex gap-1.5 items-center">
        {PLANS.map((plan) => (
          <button
            key={plan}
            onClick={() => updateParam('plan', plan)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              defaultPlan === plan || (plan === 'ALL' && !defaultPlan)
                ? 'bg-slate-600 text-white'
                : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'
            )}
          >
            {plan === 'ALL' ? 'Alle' : plan}
          </button>
        ))}
      </div>
    </div>
  )
}
