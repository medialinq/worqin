'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { resendVerification } from '../actions'

export default function VerifyPage() {
  const t = useTranslations('auth.verify')
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [resent, setResent] = useState(false)

  async function handleResend() {
    if (!email) return
    await resendVerification(email)
    setResent(true)
    setTimeout(() => setResent(false), 5000)
  }

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
        <Mail className="size-8 text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('description', { email })}
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="ghost"
          className="h-11 w-full"
          onClick={handleResend}
          disabled={resent}
        >
          {resent ? '...' : t('resend')}
        </Button>
        <Link href="/login">
          <Button variant="outline" className="h-11 w-full">
            {t('backToLogin')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
