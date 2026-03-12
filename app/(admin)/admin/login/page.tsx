'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BRAND } from '@/config/brand'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Inloggen mislukt')
        return
      }

      router.push('/admin/dashboard')
      router.refresh()
    } catch {
      setError('Verbindingsfout — probeer het opnieuw')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {BRAND.name}
            </span>
            <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
              Admin
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Toegang voor {BRAND.name}-medewerkers
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300">
                E-mailadres
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@worqin.app"
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-accent"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300">
                Wachtwoord
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-accent"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 text-white"
            >
              {loading ? 'Inloggen...' : 'Inloggen'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
