'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  User,
  Settings2,
  Bell,
  Calendar,
  BookOpen,
  ShieldCheck,
  Timer,
  CreditCard,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockUser, mockOrganization, mockTimerTemplates, mockDBAReport, mockCalendarConnections } from '@/lib/mock'

interface SettingsCardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  status?: React.ReactNode
  danger?: boolean
}

function SettingsCard({ href, icon, title, description, status, danger }: SettingsCardProps) {
  return (
    <Link href={href} className="group block">
      <Card
        className={`h-full p-6 transition-colors hover:bg-accent/50 ${
          danger ? 'border-destructive/50' : ''
        }`}
      >
        <CardContent className="flex items-start gap-4 p-0">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
              danger ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
            }`}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium">{title}</h3>
              {status}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function SettingsOverview() {
  const t = useTranslations('settings')
  const connectedCount = mockCalendarConnections.filter((c) => c.isActive).length
  const dbaScore = mockDBAReport.score

  const scoreColorMap = {
    GOOD: 'bg-success/10 text-success',
    MEDIUM: 'bg-warning/10 text-warning',
    LOW: 'bg-destructive/10 text-destructive',
  } as const

  return (
    <div className="max-w-5xl space-y-4">
      {/* Main settings grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Profile */}
        <SettingsCard
          href="/settings/account"
          icon={<User className="size-5" />}
          title={t('profile.title')}
          description={t('profile.description')}
          status={
            <span className="truncate text-xs text-muted-foreground">
              {mockUser.name}
            </span>
          }
        />

        {/* Work preferences */}
        <SettingsCard
          href="/settings/account"
          icon={<Settings2 className="size-5" />}
          title={t('preferences.title')}
          description={t('preferences.description')}
          status={
            <span className="font-mono text-xs text-muted-foreground">
              {mockUser.weeklyHourGoal}u
            </span>
          }
        />

        {/* Notifications */}
        <SettingsCard
          href="/settings/account"
          icon={<Bell className="size-5" />}
          title={t('notifications.title')}
          description={t('notifications.description')}
          status={
            <Badge variant={mockUser.notifEnabled ? 'default' : 'secondary'}>
              {mockUser.notifEnabled ? t('notifications.enabled') : 'Uit'}
            </Badge>
          }
        />

        {/* Agenda integrations */}
        <SettingsCard
          href="/settings/calendar"
          icon={<Calendar className="size-5" />}
          title={t('integrations.agenda')}
          description={t('integrations.agendaDescription')}
          status={
            connectedCount > 0 ? (
              <Badge className="bg-success/10 text-success">{t('integrations.connected')}</Badge>
            ) : (
              <Badge variant="secondary">{t('integrations.disconnected')}</Badge>
            )
          }
        />

        {/* Jortt */}
        <SettingsCard
          href="/settings/calendar"
          icon={<BookOpen className="size-5" />}
          title={t('integrations.jortt')}
          description={t('integrations.jorttDescription')}
          status={
            <Badge className="bg-success/10 text-success">{t('integrations.connected')}</Badge>
          }
        />

        {/* Compliance */}
        <SettingsCard
          href="/settings/compliance"
          icon={<ShieldCheck className="size-5" />}
          title={t('compliance.title')}
          description={t('compliance.description')}
          status={
            <Badge className={scoreColorMap[dbaScore]}>
              {t(`compliance.scores.${dbaScore.toLowerCase() as 'good' | 'medium' | 'low'}`)}
            </Badge>
          }
        />

        {/* Timer templates */}
        <SettingsCard
          href="/settings/templates"
          icon={<Timer className="size-5" />}
          title={t('templates.title')}
          description={t('templates.description')}
          status={
            <span className="font-mono text-xs text-muted-foreground">
              {mockTimerTemplates.length}
            </span>
          }
        />

        {/* Subscription */}
        <SettingsCard
          href="/settings/account"
          icon={<CreditCard className="size-5" />}
          title={t('subscription.title')}
          description={t('subscription.description')}
          status={
            <Badge>{mockOrganization.plan}</Badge>
          }
        />
      </div>

      {/* Danger zone — separate, below */}
      <SettingsCard
        href="/settings/account"
        icon={<AlertTriangle className="size-5" />}
        title={t('dangerZone.title')}
        description={t('dangerZone.description')}
        danger
      />
    </div>
  )
}
