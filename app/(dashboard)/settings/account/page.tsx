import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeading } from '@/components/layout/page-heading'
import { AccountSettings } from '@/components/settings/account-settings'

export default async function AccountPage() {
  const t = await getTranslations('pages')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch organization
  const { data: organization } = profile?.organization_id
    ? await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single()
    : { data: null }

  return (
    <div className="space-y-4">
      <PageHeading title={t('account')} />
      <AccountSettings
        user={profile ? {
          ...profile,
          name: profile.name ?? '',
          rounding_interval: profile.rounding_interval ?? '15',
        } : null}
        organization={organization ?? null}
        authEmail={user.email ?? ''}
      />
    </div>
  )
}
