import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'admin_session'
const EXPIRY_HOURS = 8

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set')
  return secret
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

export function createAdminSessionToken(): string {
  const secret = getSecret()
  const expiresAt = Date.now() + EXPIRY_HOURS * 60 * 60 * 1000
  const payload = `admin:${expiresAt}`
  const sig = sign(payload, secret)
  return `${payload}.${sig}`
}

export function verifyAdminSessionToken(token: string): boolean {
  try {
    const secret = getSecret()
    const lastDot = token.lastIndexOf('.')
    if (lastDot === -1) return false

    const payload = token.slice(0, lastDot)
    const sig = token.slice(lastDot + 1)

    const expectedSig = sign(payload, secret)
    if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'))) {
      return false
    }

    const parts = payload.split(':')
    if (parts.length !== 2) return false

    const expiresAt = parseInt(parts[1], 10)
    if (isNaN(expiresAt) || Date.now() > expiresAt) return false

    return true
  } catch {
    return false
  }
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return false
  return verifyAdminSessionToken(token)
}

export function getAdminCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: EXPIRY_HOURS * 60 * 60,
    path: '/',
  }
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME }
