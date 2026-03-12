'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Unlink,
  RefreshCw,
  Link2,
  Loader2,
} from 'lucide-react'
import { GoogleCalendarIcon } from '@/components/icons/google-calendar-icon'
import { MicrosoftOutlookIcon } from '@/components/icons/microsoft-outlook-icon'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { disconnectCalendar, reconnectCalendar, syncCalendar } from '@/app/(dashboard)/settings/calendar/actions'

type ConnectionState = 'connected' | 'disconnected' | 'error'

interface CalendarConnection {
  id: string
  provider: string
  accountEmail: string
  isActive: boolean
  lastSyncedAt: string | null
}

interface AgendaSettingsProps {
  connections: CalendarConnection[]
}

interface AgendaIntegration {
  provider: string
  label: string
  icon: React.ReactNode
  state: ConnectionState
  email?: string
  lastSync?: string
  connectionId?: string
}

export function AgendaSettings({ connections }: AgendaSettingsProps) {
  const t = useTranslations('settings.integrations')
  const router = useRouter()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const googleConn = connections.find((c) => c.provider === 'GOOGLE')
  const microsoftConn = connections.find((c) => c.provider === 'MICROSOFT')

  const agendaIntegrations: AgendaIntegration[] = [
    {
      provider: 'GOOGLE',
      label: t('googleCalendar'),
      icon: <GoogleCalendarIcon className="size-5" />,
      state: googleConn?.isActive ? 'connected' : (googleConn ? 'error' : 'disconnected') as ConnectionState,
      email: googleConn?.accountEmail,
      lastSync: googleConn?.lastSyncedAt ?? undefined,
      connectionId: googleConn?.id,
    },
    {
      provider: 'MICROSOFT',
      label: t('outlook'),
      icon: <MicrosoftOutlookIcon className="size-5" />,
      state: microsoftConn?.isActive ? 'connected' : (microsoftConn ? 'error' : 'disconnected') as ConnectionState,
      email: microsoftConn?.accountEmail,
      lastSync: microsoftConn?.lastSyncedAt ?? undefined,
      connectionId: microsoftConn?.id,
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

  async function handleConnect(provider: string) {
    window.location.href = `/api/agenda/connect?provider=${provider}`
  }

  async function handleDisconnect(connectionId: string) {
    setLoadingAction(`disconnect-${connectionId}`)
    try {
      await disconnectCalendar(connectionId)
      router.refresh()
    } finally {
      setLoadingAction(null)
    }
  }

  async function handleReconnect(connectionId: string, provider: string) {
    setLoadingAction(`reconnect-${connectionId}`)
    try {
      await reconnectCalendar(connectionId)
      // After marking inactive, redirect to OAuth flow
      window.location.href = `/api/agenda/connect?provider=${provider}`
    } finally {
      setLoadingAction(null)
    }
  }

  async function handleSync(connectionId: string) {
    setLoadingAction(`sync-${connectionId}`)
    try {
      await syncCalendar(connectionId)
      router.refresh()
    } finally {
      setLoadingAction(null)
    }
  }

  function isLoading(action: string, id?: string) {
    return loadingAction === `${action}-${id}`
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
              <div className="flex items-center gap-2">
                {integration.state === 'connected' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(integration.connectionId!)}
                      disabled={isLoading('sync', integration.connectionId)}
                    >
                      {isLoading('sync', integration.connectionId) ? (
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-1.5 size-3.5" />
                      )}
                      {t('sync')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(integration.connectionId!)}
                      disabled={isLoading('disconnect', integration.connectionId)}
                    >
                      {isLoading('disconnect', integration.connectionId) ? (
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      ) : (
                        <Unlink className="mr-1.5 size-3.5" />
                      )}
                      {t('disconnect')}
                    </Button>
                  </>
                )}
                {integration.state === 'disconnected' && (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(integration.provider)}
                  >
                    <Link2 className="mr-1.5 size-3.5" />
                    {t('connect')}
                  </Button>
                )}
                {integration.state === 'error' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReconnect(integration.connectionId!, integration.provider)}
                    disabled={isLoading('reconnect', integration.connectionId)}
                  >
                    {isLoading('reconnect', integration.connectionId) ? (
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-1.5 size-3.5" />
                    )}
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
