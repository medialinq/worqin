'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPassword } from '../actions'

const forgotSchema = z.object({
  email: z.email(),
})

type ForgotFormData = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword')
  const tLogin = useTranslations('auth.login')
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  })

  async function onSubmit(data: ForgotFormData) {
    setIsLoading(true)
    try {
      const result = await forgotPassword(data)
      if (result?.success) {
        setSent(true)
      }
    } catch {
      // handled
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">{t('title')}</h2>
      </div>

      {sent ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10">
            <Mail className="size-8 text-success" />
          </div>
          <p className="text-sm text-muted-foreground">{t('sent')}</p>
          <Link href="/login">
            <Button variant="outline" className="h-11 w-full">
              {tLogin('title')}
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{tLogin('email')}</Label>
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
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="h-11 w-full"
              disabled={isLoading}
            >
              {isLoading ? '...' : t('submit')}
            </Button>
          </form>

          <p className="text-center text-sm">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground"
            >
              {tLogin('title')}
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
