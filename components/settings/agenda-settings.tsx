'use client'

import { useTranslations } from 'next-intl'
import {
  Calendar,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Unlink,
  RefreshCw,
  Link2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockCalendarConnections } from '@/lib/mock'

type ConnectionState = 'connected' | 'disconnected' | 'error'

interface MockIntegration {
  provider: string
  label: string
  icon: React.ReactNode
  state: ConnectionState
  email?: string
  lastSync?: string
}

export function AgendaSettings() {
  const t = useTranslations('settings.integrations')

  const googleConn = mockCalendarConnections.find((c) => c.provider === 'GOOGLE')
  const outlookConn = mockCalendarConnections.find((c) => c.provider === 'MICROSOFT')

  // Build mock integrations with various states for demo
  const agendaIntegrations: MockIntegration[] = [
    {
      provider: 'GOOGLE',
      label: t('googleCalendar'),
      icon: <Calendar className="size-5" />,
      state: googleConn?.isActive ? 'connected' : 'disconnected',
      email: googleConn?.accountEmail,
      lastSync: googleConn?.lastSyncedAt ?? undefined,
    },
    {
      provider: 'MICROSOFT',
      label: t('outlook'),
      icon: <Calendar className="size-5" />,
      state: outlookConn?.isActive ? 'connected' : 'disconnected',
      email: outlookConn?.accountEmail,
      lastSync: outlookConn?.lastSyncedAt ?? undefined,
    },
    // Error state demo
    {
      provider: 'ERROR_DEMO',
      label: 'Outlook (Demo fout)',
      icon: <Calendar className="size-5" />,
      state: 'error',
      email: 'demo@example.com',
    },
    // Disconnected state demo
    {
      provider: 'DISCONNECTED_DEMO',
      label: 'Apple Calendar',
      icon: <Calendar className="size-5" />,
      state: 'disconnected',
    },
  ]

  const stateConfig = {
    connected: {
      badge: <Badge className="bg-success/10 text-success"><CheckCircle2 className="mr-1 size-3" />{t('connected')}</Badge>,
      icon: <CheckCircle2 className="size-5 text-success" />,
    },
    disconnected: {
      badge: <Badge variant="secondary">{t('disconnected')}</Badge>,
      icon: <XCircle className="size-5 text-muted-foreground" />,
    },
    error: {
      badge: <Badge className="bg-destructive/10 text-destructive"><AlertCircle className="mr-1 size-3" />{t('error')}</Badge>,
      icon: <AlertCircle className="size-5 text-destructive" />,
    },
  }

  return (
    <div className="max-w-4xl space-y-4">
      {/* Agenda connections */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>{t('agenda')}</CardTitle>
          <CardDescription>{t('agendaDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-0">
          {agendaIntegrations.map((integration) => (
            <div
              key={integration.provider}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  {integration.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{integration.label}</span>
                    {stateConfig[integration.state].badge}
                  </div>
                  {integration.email && (
                    <p className="text-xs text-muted-foreground">{integration.email}</p>
                  )}
                  {integration.lastSync && integration.state === 'connected' && (
                    <p className="text-xs text-muted-foreground">
                      {t('lastSync')}: {new Date(integration.lastSync).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div>
                {integration.state === 'connected' && (
                  <Button variant="outline" size="sm">
                    <Unlink className="mr-1.5 size-3.5" />
                    {t('disconnect')}
                  </Button>
                )}
                {integration.state === 'disconnected' && (
                  <Button size="sm">
                    <Link2 className="mr-1.5 size-3.5" />
                    {t('connect')}
                  </Button>
                )}
                {integration.state === 'error' && (
                  <Button variant="destructive" size="sm">
                    <RefreshCw className="mr-1.5 size-3.5" />
                    {t('reconnect')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Jortt connection */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5" />
            {t('jortt')}
          </CardTitle>
          <CardDescription>{t('jorttDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-0">
          {/* Connected state */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <BookOpen className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Jortt</span>
                  <Badge className="bg-success/10 text-success">
                    <CheckCircle2 className="mr-1 size-3" />
                    {t('connected')}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Van den Berg Consultancy
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('lastSync')}: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Unlink className="mr-1.5 size-3.5" />
              {t('disconnect')}
            </Button>
          </div>

          {/* Not connected state (demo) */}
          <div className="flex items-center justify-between rounded-lg border border-dashed border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <BookOpen className="size-5 text-muted-foreground" />
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">{t('connectJortt')}</span>
              </div>
            </div>
            <Button size="sm">
              <Link2 className="mr-1.5 size-3.5" />
              {t('connect')}
            </Button>
          </div>

          {/* Error state (demo) */}
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
                <BookOpen className="size-5 text-destructive" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Jortt (fout demo)</span>
                  <Badge className="bg-destructive/10 text-destructive">
                    <AlertCircle className="mr-1 size-3" />
                    {t('error')}
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="destructive" size="sm">
              <RefreshCw className="mr-1.5 size-3.5" />
              {t('reconnect')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
