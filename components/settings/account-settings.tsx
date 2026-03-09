'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Camera,
  Check,
  Crown,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { mockUser, mockOrganization } from '@/lib/mock'
import type { RoundingInterval, TimeEntryType, Plan } from '@/lib/mock/types'

// --- Profile form ---

const profileSchema = z.object({
  name: z.string().min(1),
})

type ProfileFormValues = z.infer<typeof profileSchema>

// --- Preferences form ---

const preferencesSchema = z.object({
  weeklyGoal: z.string().min(1),
  roundingInterval: z.string(),
  defaultType: z.string(),
})

type PreferencesFormValues = z.infer<typeof preferencesSchema>

// --- Plan features ---

const PLANS: { key: Plan; price: string }[] = [
  { key: 'TRIAL', price: '€0' },
  { key: 'STARTER', price: '€9' },
  { key: 'PRO', price: '€19' },
  { key: 'TEAM', price: '€29' },
]

export function AccountSettings() {
  const t = useTranslations('settings')
  const tc = useTranslations('common')
  const tt = useTranslations('timer.types')

  const [profileSaved, setProfileSaved] = useState(false)
  const [prefsSaved, setPrefsSaved] = useState(false)
  const [notifSaved, setNotifSaved] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Notification state (local mock)
  const [notifEnabled, setNotifEnabled] = useState(mockUser.notifEnabled)
  const [notifFrom, setNotifFrom] = useState(mockUser.notifWindowStart)
  const [notifTo, setNotifTo] = useState(mockUser.notifWindowEnd)
  const [notifInterval, setNotifInterval] = useState(String(mockUser.notifIntervalMins))
  const [notifWeekdaysOnly, setNotifWeekdaysOnly] = useState(mockUser.notifWeekdaysOnly)
  const [nudges, setNudges] = useState({
    gapReminder: true,
    endOfDay: true,
    weeklyReport: true,
    budgetWarning: true,
    complianceAlert: false,
  })

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: mockUser.name },
  })

  // Preferences form
  const prefsForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      weeklyGoal: String(mockUser.weeklyHourGoal),
      roundingInterval: mockUser.roundingInterval,
      defaultType: 'BILLABLE',
    },
  })

  function onProfileSubmit(_data: ProfileFormValues) {
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  function onPrefsSubmit(_data: PreferencesFormValues) {
    setPrefsSaved(true)
    setTimeout(() => setPrefsSaved(false), 2000)
  }

  function onNotifSave() {
    setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 2000)
  }

  const initials = mockUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const roundingOptions: { value: RoundingInterval; label: string }[] = [
    { value: 'NONE', label: t('preferences.roundingOptions.none') },
    { value: 'MIN_15', label: t('preferences.roundingOptions.min15') },
    { value: 'MIN_30', label: t('preferences.roundingOptions.min30') },
    { value: 'MIN_60', label: t('preferences.roundingOptions.min60') },
  ]

  const typeOptions: { value: TimeEntryType; label: string }[] = [
    { value: 'BILLABLE', label: tt('billable') },
    { value: 'NON_BILLABLE', label: tt('nonBillable') },
    { value: 'PRO_BONO', label: tt('proBono') },
    { value: 'INDIRECT_ADMIN', label: tt('admin') },
    { value: 'INDIRECT_SALES', label: tt('sales') },
    { value: 'INDIRECT_TRAVEL', label: tt('travel') },
    { value: 'INDIRECT_LEARNING', label: tt('learning') },
    { value: 'INDIRECT_OTHER', label: tt('other') },
  ]

  const intervalOptions = [
    { value: '30', label: t('notifications.intervalOptions.min30') },
    { value: '60', label: t('notifications.intervalOptions.min60') },
    { value: '90', label: t('notifications.intervalOptions.min90') },
    { value: '120', label: t('notifications.intervalOptions.min120') },
  ]

  const nudgeKeys = ['gapReminder', 'endOfDay', 'weeklyReport', 'budgetWarning', 'complianceAlert'] as const

  return (
    <div className="max-w-4xl space-y-4">
      {/* ===== PROFILE ===== */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>{t('profile.title')}</CardTitle>
          <CardDescription>{t('profile.description')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar size="lg" className="size-16">
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <Button type="button" variant="outline" size="sm">
                <Camera className="mr-1.5 size-3.5" />
                {t('profile.changePhoto')}
              </Button>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('profile.name')}</label>
              <Input
                {...profileForm.register('name')}
                aria-invalid={!!profileForm.formState.errors.name}
              />
            </div>

            {/* Email (disabled) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('profile.email')}</label>
              <Input value={mockUser.email} disabled />
              <p className="text-xs text-muted-foreground">{t('profile.emailHint')}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit">{tc('save')}</Button>
              {profileSaved && (
                <span className="flex items-center gap-1 text-sm text-success">
                  <Check className="size-4" />
                  {t('profile.saved')}
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ===== WORK PREFERENCES ===== */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>{t('preferences.title')}</CardTitle>
          <CardDescription>{t('preferences.description')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={prefsForm.handleSubmit(onPrefsSubmit)} className="space-y-4">
            {/* Weekly goal */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('preferences.weeklyGoal')}</label>
              <Input
                type="number"
                min={1}
                max={80}
                className="w-32 font-mono"
                {...prefsForm.register('weeklyGoal')}
              />
            </div>

            {/* Rounding interval */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('preferences.rounding')}</label>
              <Select
                value={prefsForm.watch('roundingInterval')}
                onValueChange={(val) => prefsForm.setValue('roundingInterval', val ?? 'NONE')}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roundingOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('preferences.defaultType')}</label>
              <Select
                value={prefsForm.watch('defaultType')}
                onValueChange={(val) => prefsForm.setValue('defaultType', val ?? 'BILLABLE')}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit">{tc('save')}</Button>
              {prefsSaved && (
                <span className="flex items-center gap-1 text-sm text-success">
                  <Check className="size-4" />
                  {t('preferences.saved')}
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ===== NOTIFICATIONS ===== */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>{t('notifications.title')}</CardTitle>
          <CardDescription>{t('notifications.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          {/* Master toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('notifications.enabled')}</label>
            <Switch
              checked={notifEnabled}
              onCheckedChange={setNotifEnabled}
            />
          </div>

          {notifEnabled && (
            <>
              <Separator />

              {/* Time window */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('notifications.window')}</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t('notifications.windowFrom')}</span>
                  <Input
                    type="time"
                    value={notifFrom}
                    onChange={(e) => setNotifFrom(e.target.value)}
                    className="w-28 font-mono"
                  />
                  <span className="text-sm text-muted-foreground">{t('notifications.windowTo')}</span>
                  <Input
                    type="time"
                    value={notifTo}
                    onChange={(e) => setNotifTo(e.target.value)}
                    className="w-28 font-mono"
                  />
                </div>
              </div>

              {/* Interval */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('notifications.interval')}</label>
                <Select value={notifInterval} onValueChange={(val) => { if (val) setNotifInterval(val) }}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {intervalOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weekdays only */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{t('notifications.weekdaysOnly')}</label>
                <Switch
                  checked={notifWeekdaysOnly}
                  onCheckedChange={setNotifWeekdaysOnly}
                />
              </div>

              <Separator />

              {/* Per AI-type toggles */}
              <div className="space-y-3">
                <label className="text-sm font-medium">{t('notifications.nudgeTypes')}</label>
                {nudgeKeys.map((key) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm">{t(`notifications.nudge.${key}`)}</span>
                    <Switch
                      checked={nudges[key]}
                      onCheckedChange={(val) =>
                        setNudges((prev) => ({ ...prev, [key]: val }))
                      }
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button type="button" onClick={onNotifSave}>{tc('save')}</Button>
            {notifSaved && (
              <span className="flex items-center gap-1 text-sm text-success">
                <Check className="size-4" />
                {t('notifications.saved')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ===== SUBSCRIPTION ===== */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>{t('subscription.title')}</CardTitle>
          <CardDescription>{t('subscription.description')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => {
              const isCurrent = mockOrganization.plan === plan.key
              const planKey = plan.key.toLowerCase() as 'trial' | 'starter' | 'pro' | 'team'
              const featureKey = `${planKey}Features` as const
              return (
                <div
                  key={plan.key}
                  className={`rounded-xl border p-4 ${
                    isCurrent ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{t(`subscription.plans.${planKey}`)}</h4>
                    {isCurrent && (
                      <Badge>
                        <Crown className="mr-1 size-3" />
                        {t('subscription.current')}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-2xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t(`subscription.features.${featureKey}`)}
                  </p>
                  {!isCurrent && plan.key !== 'TRIAL' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                    >
                      {t('subscription.upgrade')}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm">
              {t('subscription.manage')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ===== DANGER ZONE ===== */}
      <Card className="border-destructive/50 p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            {t('dangerZone.title')}
          </CardTitle>
          <CardDescription>{t('dangerZone.description')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <p className="mb-4 text-sm text-muted-foreground">
            {t('dangerZone.deleteWarning')}
          </p>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            {t('dangerZone.deleteAccount')}
          </Button>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dangerZone.deleteAccount')}</DialogTitle>
            <DialogDescription>{t('dangerZone.deleteWarning')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('dangerZone.confirmDelete')}</label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={t('dangerZone.confirmWord')}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeleteConfirmText('')
              }}
            >
              {tc('cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== t('dangerZone.confirmWord')}
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeleteConfirmText('')
              }}
            >
              {t('dangerZone.deleteButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
