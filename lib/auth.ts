import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Get authenticated user context for server components and server actions.
 * Redirects to /login if not authenticated or no profile found.
 *
 * Note: Uses getUser() which validates the token server-side.
 * getClaims() does not exist in @supabase/supabase-js v2.x.
 * getUser() is preferred over getSession() because it verifies the JWT
 * with the Supabase Auth server rather than just decoding it locally.
 */
export async function getAuthContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id, role, weekly_hour_goal, rounding_interval')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return {
    supabase,
    user,
    userId: user.id,
    organizationId: profile.organization_id as string,
    profile,
  }
}
