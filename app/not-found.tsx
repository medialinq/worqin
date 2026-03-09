import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { BRAND } from "@/config/brand"

export default async function NotFound() {
  const t = await getTranslations("errors.notFound")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-8xl font-extrabold text-primary">404</div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("goHome")}
        </Link>
        <p className="text-xs text-muted-foreground">
          {BRAND.name}
        </p>
      </div>
    </div>
  )
}
