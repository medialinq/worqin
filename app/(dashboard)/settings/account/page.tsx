import { getTranslations } from 'next-intl/server'
import { PageHeading } from '@/components/layout/page-heading'
import { AccountSettings } from '@/components/settings/account-settings'

export default async function AccountPage() {
  const t = await getTranslations('pages')
  return (
    <div className="space-y-4">
      <PageHeading title={t('account')} />
      <AccountSettings />
    </div>
  )
}
