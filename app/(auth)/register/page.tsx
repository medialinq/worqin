"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { User, Mail, Lock, Building2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GoogleIcon, MicrosoftIcon } from "@/components/auth/oauth-icons"

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  company: z.string().min(1),
})

type RegisterFormData = z.infer<typeof registerSchema>

function getPasswordStrength(password: string): "weak" | "medium" | "strong" {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 2) return "weak"
  if (score <= 3) return "medium"
  return "strong"
}

const strengthColors = {
  weak: "bg-destructive",
  medium: "bg-warning",
  strong: "bg-success",
} as const

const strengthWidths = {
  weak: "w-1/3",
  medium: "w-2/3",
  strong: "w-full",
} as const

export default function RegisterPage() {
  const t = useTranslations("auth.register")
  const tOr = useTranslations("auth")
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch("password", "")
  const strength = useMemo(() => getPasswordStrength(password), [password])

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true)
    try {
      // TODO: Supabase auth signup
      console.log("Register:", data)
      router.push(`/verify?email=${encodeURIComponent(data.email)}`)
    } catch {
      // handled by error state
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">{t("title")}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("name")}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              type="text"
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
          <Label htmlFor="email">{t("email")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="naam@bedrijf.nl"
              className="h-11 pl-10"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              className="h-11 pl-10 pr-10"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${strengthColors[strength]} ${strengthWidths[strength]}`}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t(`passwordStrength.${strength}`)}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">{t("company")}</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="company"
              type="text"
              className="h-11 pl-10"
              aria-invalid={!!errors.company}
              {...register("company")}
            />
          </div>
          {errors.company && (
            <p className="text-sm text-destructive">{errors.company.message}</p>
          )}
        </div>

        <Button type="submit" className="h-11 w-full" disabled={isLoading}>
          {isLoading ? "..." : t("submit")}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-sm text-muted-foreground">{tOr("or")}</span>
        <Separator className="flex-1" />
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="h-11 w-full gap-2"
          onClick={() => {
            // TODO: Google OAuth
          }}
        >
          <GoogleIcon className="size-5" />
          {t("title") === "Account aanmaken" ? "Registreer met Google" : "Register with Google"}
        </Button>
        <Button
          variant="outline"
          className="h-11 w-full gap-2"
          onClick={() => {
            // TODO: Microsoft OAuth
          }}
        >
          <MicrosoftIcon className="size-5" />
          {t("title") === "Account aanmaken" ? "Registreer met Microsoft" : "Register with Microsoft"}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("login")}
        </Link>
      </p>
    </div>
  )
}
