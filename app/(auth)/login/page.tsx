'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { GoogleIcon, MicrosoftIcon } from '@/components/auth/oauth-icons'
import { login, signInWithProvider } from '../actions'

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const t = useTranslations('auth.login')
  const tOr = useTranslations('auth')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    setError(null)
    try {
      const result = await login(data)
      if (result?.error) {
        setError(t('errors.invalidCredentials'))
      }
    } catch {
      // redirect throws, which is expected
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">{t('title')}</h2>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="naam@bedrijf.nl"
              className="h-11 pl-10"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="h-11 pl-10 pr-10"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="h-11 w-full" disabled={isLoading}>
          {isLoading ? '...' : t('submit')}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-sm text-muted-foreground">{tOr('or')}</span>
        <Separator className="flex-1" />
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="h-11 w-full gap-2"
          onClick={() => signInWithProvider('google')}
        >
          <GoogleIcon className="size-5" />
          {t('google')}
        </Button>
        <Button
          variant="outline"
          className="h-11 w-full gap-2"
          onClick={() => signInWithProvider('azure')}
        >
          <MicrosoftIcon className="size-5" />
          {t('microsoft')}
        </Button>
      </div>

      <div className="space-y-2 text-center text-sm">
        <Link
          href="/forgot-password"
          className="text-muted-foreground hover:text-foreground"
        >
          {t('forgotPassword')}
        </Link>
        <p className="text-muted-foreground">
          {t('noAccount')}{' '}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  )
}
