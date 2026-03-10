'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ok, err, type ActionResult } from '@/lib/action-utils'
import { rateLimit } from '@/lib/rate-limit'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations'

// SECURITY: Validate origin against allowed hosts to prevent open redirect
async function getOrigin() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl) return siteUrl

  const h = await headers()
  const allowedHosts = new Set(
    (process.env.ALLOWED_HOSTS || 'localhost:3000').split(',').map((s) => s.trim())
  )
  const host = h.get('x-forwarded-host') || h.get('host') || ''
  if (host && allowedHosts.has(host)) {
    const proto = h.get('x-forwarded-proto') || 'https'
    return `${proto}://${host}`
  }
  return 'http://localhost:3000'
}

export async function login(formData: { email: string; password: string }): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(formData)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { success: allowed } = rateLimit(`login:${parsed.data.email}`, 5, 60_000)
  if (!allowed) return err('Too many attempts. Please try again later.')

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) return err(error.message)

  // Check if user has completed onboarding
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('onboarded_at')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.onboarded_at) {
      redirect('/onboarding')
    }
  }

  redirect('/dashboard')
}

export async function register(formData: {
  name: string
  email: string
  password: string
  company: string
}): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(formData)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { success: allowed } = rateLimit(`register:${parsed.data.email}`, 3, 60_000)
  if (!allowed) return err('Too many attempts. Please try again later.')

  const supabase = await createClient()
  const origin = await getOrigin()

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        company: parsed.data.company,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) return err(error.message)

  redirect(`/verify?email=${encodeURIComponent(parsed.data.email)}`)
}

export async function forgotPassword(formData: { email: string }): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(formData)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { success: allowed } = rateLimit(`forgot:${parsed.data.email}`, 3, 300_000)
  if (!allowed) return err('Too many attempts. Please try again later.')

  const supabase = await createClient()
  const origin = await getOrigin()

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  if (error) return err(error.message)

  return ok()
}

export async function resetPassword(formData: { password: string }): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(formData)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) return err(error.message)

  return ok()
}

export async function resendVerification(email: string): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email })
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Validation failed')

  const { success: allowed } = rateLimit(`resend:${parsed.data.email}`, 2, 300_000)
  if (!allowed) return err('Too many attempts. Please try again later.')

  const supabase = await createClient()
  const origin = await getOrigin()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) return err(error.message)

  return ok()
}

export async function signInWithProvider(provider: 'google' | 'azure') {
  const supabase = await createClient()
  const origin = await getOrigin()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) return err(error.message)

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
