'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function getOrigin() {
  const h = await headers()
  const origin = h.get('origin') || h.get('referer')?.replace(/\/[^/]*$/, '') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return origin.replace(/\/$/, '')
}

export async function login(formData: { email: string; password: string }) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    return { error: error.message }
  }

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

    if (!profile) {
      redirect('/onboarding')
    }

    if (!profile.onboarded_at) {
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
}) {
  const supabase = await createClient()

  const origin = await getOrigin()

  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        name: formData.name,
        company: formData.company,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect(`/verify?email=${encodeURIComponent(formData.email)}`)
}

export async function forgotPassword(formData: { email: string }) {
  const supabase = await createClient()

  const origin = await getOrigin()

  const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function resetPassword(formData: { password: string }) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: formData.password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function resendVerification(email: string) {
  const supabase = await createClient()

  const origin = await getOrigin()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
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

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
