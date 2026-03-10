"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  User,
  Building2,
  Mail,
  Play,
  Calendar,
  ArrowRight,
} from "lucide-react"
import { BRAND } from "@/config/brand"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { GoogleIcon, MicrosoftIcon } from "@/components/auth/oauth-icons"
import {
  saveWelcomeData,
  createFirstClient,
  completeOnboarding as completeOnboardingAction,
  startFirstTimer,
} from "./actions"

const TOTAL_STEPS = 5

// --- Step schemas ---
const welcomeSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
})

const clientSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().optional(),
  clientRate: z.string().optional(),
})

type WelcomeData = z.infer<typeof welcomeSchema>
type ClientData = z.infer<typeof clientSchema>

// --- Confetti data (pre-generated to avoid impure render calls) ---
const CONFETTI_COLORS = [
  "#3D52D5",
  "#5068E8",
  "#22C55E",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
]

const CONFETTI_PIECES = Array.from({ length: 40 }).map((_, i) => ({
  left: `${(i * 2.5 + (i % 7) * 3.2) % 100}%`,
  delay: `${(i * 0.025) % 1}s`,
  duration: `${1.5 + (i % 5) * 0.3}s`,
  color: CONFETTI_COLORS[i % 6],
  size: `${6 + (i % 4) * 1.5}px`,
  round: i % 2 === 0,
}))

// --- Confetti component ---
function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {CONFETTI_PIECES.map((piece, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            backgroundColor: piece.color,
            width: piece.size,
            height: piece.size,
            borderRadius: piece.round ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  )
}

// --- Step 1: Welcome ---
function StepWelcome({
  onNext,
  defaultValues,
}: {
  onNext: (data: WelcomeData) => void
  defaultValues?: Partial<WelcomeData>
}) {
  const t = useTranslations("onboarding")
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WelcomeData>({
    resolver: zodResolver(welcomeSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <h2 className="text-center text-2xl font-bold text-foreground">
        {t("welcome.title", { brand: BRAND.name })}
      </h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("welcome.name")}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              className="h-11 pl-10"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">{t("welcome.company")}</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="company"
              className="h-11 pl-10"
              aria-invalid={!!errors.company}
              {...register("company")}
            />
          </div>
          {errors.company && (
            <p className="text-sm text-destructive">{errors.company.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="h-11 w-full gap-2">
        {t("next")}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  )
}

// --- Step 2: First client ---
function StepClient({
  onNext,
  onUseDefault,
}: {
  onNext: (data: ClientData) => void
  onUseDefault: () => void
}) {
  const t = useTranslations("onboarding")
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientData>({
    resolver: zodResolver(clientSchema),
  })

  return (
    <div className="space-y-6">
      <h2 className="text-center text-2xl font-bold text-foreground">
        {t("client.title")}
      </h2>

      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clientName">{t("client.name")}</Label>
          <Input
            id="clientName"
            className="h-11"
            aria-invalid={!!errors.clientName}
            {...register("clientName")}
          />
          {errors.clientName && (
            <p className="text-sm text-destructive">{errors.clientName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientEmail">{t("client.email")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="clientEmail"
              type="email"
              className="h-11 pl-10"
              {...register("clientEmail")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientRate">{t("client.rate")}</Label>
          <Input
            id="clientRate"
            type="number"
            className="h-11 font-mono"
            placeholder="85"
            {...register("clientRate")}
          />
        </div>

        <Button type="submit" className="h-11 w-full gap-2">
          {t("next")}
          <ArrowRight className="size-4" />
        </Button>
      </form>

      <button
        type="button"
        onClick={onUseDefault}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        {t("client.useDefault")}
      </button>
    </div>
  )
}

// --- Step 3: Calendar ---
function StepAgenda({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const t = useTranslations("onboarding")

  return (
    <div className="space-y-6">
      <h2 className="text-center text-2xl font-bold text-foreground">
        {t("agenda.title")}
      </h2>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="h-12 w-full gap-3"
          onClick={() => {
            // TODO: Google Calendar OAuth
            onNext()
          }}
        >
          <GoogleIcon className="size-5" />
          {t("agenda.google")}
        </Button>
        <Button
          variant="outline"
          className="h-12 w-full gap-3"
          onClick={() => {
            // TODO: Outlook OAuth
            onNext()
          }}
        >
          <MicrosoftIcon className="size-5" />
          <Calendar className="sr-only" />
          {t("agenda.outlook")}
        </Button>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        {t("skip")}
      </button>
    </div>
  )
}

// --- Step 4: Jortt ---
function StepJortt({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const t = useTranslations("onboarding")

  return (
    <div className="space-y-6">
      <h2 className="text-center text-2xl font-bold text-foreground">
        {t("jortt.title")}
      </h2>

      <Button
        variant="outline"
        className="h-12 w-full gap-3"
        onClick={() => {
          // TODO: Jortt OAuth
          onNext()
        }}
      >
        {t("jortt.connect")}
      </Button>

      <button
        type="button"
        onClick={onSkip}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        {t("skip")}
      </button>
    </div>
  )
}

// --- Step 5: First timer ---
function StepTimer({
  clientName,
  onStart,
  onDashboard,
}: {
  clientName: string
  onStart: () => void
  onDashboard: () => void
}) {
  const t = useTranslations("onboarding")

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-bold text-foreground">{t("timer.title")}</h2>

      <div className="space-y-4">
        {clientName && (
          <p className="text-sm text-muted-foreground">{clientName}</p>
        )}

        <Button
          className="h-14 w-full gap-3 text-lg"
          onClick={onStart}
        >
          <Play className="size-5" />
          {t("timer.start")}
        </Button>
      </div>

      <button
        type="button"
        onClick={onDashboard}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        {t("timer.goDashboard")}
      </button>
    </div>
  )
}

// --- Main onboarding page ---
export default function OnboardingPage() {
  const t = useTranslations("onboarding")
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [welcomeData, setWelcomeData] = useState<WelcomeData>()
  const [clientName, setClientName] = useState("")
  const [clientId, setClientId] = useState<string>()
  const [showConfetti, setShowConfetti] = useState(false)

  const progressValue = (step / TOTAL_STEPS) * 100

  const completeOnboarding = useCallback(async (withTimer?: boolean) => {
    if (withTimer) {
      await startFirstTimer(clientId)
    } else {
      await completeOnboardingAction()
    }
    setShowConfetti(true)
    setTimeout(() => {
      router.push("/dashboard")
    }, 2500)
  }, [router, clientId])

  return (
    <div className="flex min-h-dvh flex-col bg-app-bg">
      {showConfetti && <Confetti />}

      {/* Progress bar */}
      <div className="border-b border-surface-border bg-surface px-4 py-4">
        <div className="mx-auto max-w-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {t("step", { current: step, total: TOTAL_STEPS })}
            </span>
            <span className="text-sm text-muted-foreground font-mono">
              {Math.round(progressValue)}%
            </span>
          </div>
          <Progress value={progressValue} />

          {/* Step dots */}
          <div className="mt-3 flex justify-center gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`size-2 rounded-full transition-colors ${
                  i + 1 <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {showConfetti ? (
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold text-foreground">
                {t("complete")}
              </h2>
            </div>
          ) : (
            <>
              {step === 1 && (
                <StepWelcome
                  defaultValues={welcomeData}
                  onNext={async (data) => {
                    setWelcomeData(data)
                    await saveWelcomeData(data)
                    setStep(2)
                  }}
                />
              )}
              {step === 2 && (
                <StepClient
                  onNext={async (data) => {
                    const result = await createFirstClient(data)
                    if ('success' in result && result.data) {
                      setClientName(result.data.name)
                      setClientId(result.data.id)
                    }
                    setStep(3)
                  }}
                  onUseDefault={async () => {
                    const result = await createFirstClient({ clientName: "Overig" })
                    if ('success' in result && result.data) {
                      setClientId(result.data.id)
                    }
                    setClientName("Overig")
                    setStep(3)
                  }}
                />
              )}
              {step === 3 && (
                <StepAgenda
                  onNext={() => setStep(4)}
                  onSkip={() => setStep(4)}
                />
              )}
              {step === 4 && (
                <StepJortt
                  onNext={() => setStep(5)}
                  onSkip={() => setStep(5)}
                />
              )}
              {step === 5 && (
                <StepTimer
                  clientName={clientName}
                  onStart={() => completeOnboarding(true)}
                  onDashboard={() => completeOnboarding(false)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
