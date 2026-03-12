import { AdminSidebar } from '@/components/admin/admin-sidebar'

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh bg-slate-950 text-slate-100 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-900">
        <div className="px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
