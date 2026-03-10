import { z } from 'zod'
import { getAuthContext } from '@/lib/auth'

// Standardized Server Action response type
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { error: string }

// Helper to create a success result
export function ok(): ActionResult<void>
export function ok<T>(data: T): ActionResult<T>
export function ok<T>(data?: T): ActionResult<T> {
  return { success: true, data: data as T }
}

// Helper to create an error result
export function err(message: string): ActionResult<never> {
  return { error: message }
}

// Sanitize Supabase/PostgreSQL errors - never expose raw DB errors to client
export function dbErr(error: { code?: string; message?: string }): ActionResult<never> {
  // Log full error server-side for debugging
  console.error('[DB Error]', error.code, error.message)

  // Map known Postgres error codes to user-friendly messages
  switch (error.code) {
    case '23505': return err('This record already exists')
    case '23503': return err('Referenced record not found')
    case '42501': return err('Permission denied')
    case 'PGRST116': return err('Record not found')
    default: return err('Something went wrong. Please try again.')
  }
}

// Auth context type for use in action files
export type AuthContext = Awaited<ReturnType<typeof getAuthContext>>

// Validate input with Zod, return parsed data or error
export function validate<T>(schema: z.ZodSchema<T>, raw: unknown): ActionResult<T> {
  const result = schema.safeParse(raw)
  if (!result.success) {
    const firstError = result.error.issues[0]
    return err(firstError?.message ?? 'Validation failed')
  }
  return ok(result.data)
}
