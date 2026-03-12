'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, CreditCard, FileText, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BRAND } from '@/config/brand'
import { adminSignOut } from '@/app/(admin)/actions'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'Organisaties', icon: Building2, href: '/admin/organizations' },
  { label: 'Subscripties', icon: CreditCard, href: '/admin/subscriptions' },
  { label: 'Audit log', icon: FileText, href: '/admin/audit' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-slate-950 border-r border-slate-800 h-screen sticky top-0">
      {/* Header */}
      <div className="flex h-14 items-center border-b border-slate-800 px-4 shrink-0">
        <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
          {BRAND.name}
        </span>
        <span className="ml-2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="shrink-0 border-t border-slate-800 p-3">
        <button
          onClick={() => adminSignOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-red-400"
        >
          <LogOut className="size-4 shrink-0" />
          Uitloggen
        </button>
      </div>
    </aside>
  )
}
