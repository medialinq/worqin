import { NextRequest, NextResponse } from 'next/server'
import { createAdminSessionToken, getAdminCookieOptions } from '@/lib/admin/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body as { email?: string; password?: string }

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Admin credentials niet geconfigureerd' },
        { status: 500 }
      )
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail en wachtwoord zijn verplicht' },
        { status: 400 }
      )
    }

    const emailMatch = email.trim().toLowerCase() === adminEmail.trim().toLowerCase()
    const passwordMatch = password === adminPassword

    if (!emailMatch || !passwordMatch) {
      return NextResponse.json(
        { error: 'Onjuiste inloggegevens' },
        { status: 401 }
      )
    }

    const token = createAdminSessionToken()
    const cookieOptions = getAdminCookieOptions()

    const response = NextResponse.json({ ok: true })
    response.cookies.set({
      name: cookieOptions.name,
      value: token,
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: cookieOptions.maxAge,
      path: cookieOptions.path,
    })

    return response
  } catch {
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}
