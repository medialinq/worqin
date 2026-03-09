import { useTranslations } from "next-intl"
import { BRAND } from "@/config/brand"

export default function Home() {
  const t = useTranslations("nav")

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-8 p-8">
        <h1 className="text-4xl font-bold text-primary">
          {BRAND.name}
        </h1>
        <p className="text-lg text-muted-foreground">
          {BRAND.tagline}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("dashboard")}
        </p>
      </main>
    </div>
  )
}
