import { cookies, headers } from "next/headers"

const SUPPORTED_LOCALES = ["nl", "en"] as const
const DEFAULT_LOCALE = "nl"
const COOKIE_NAME = "NEXT_LOCALE"

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale)
}

export async function getUserLocale(): Promise<SupportedLocale> {
  // 1. Check cookie
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(COOKIE_NAME)?.value
  if (cookieLocale && isSupportedLocale(cookieLocale)) {
    return cookieLocale
  }

  // 2. Check Accept-Language header
  const headerStore = await headers()
  const acceptLanguage = headerStore.get("accept-language")
  if (acceptLanguage) {
    const browserLocale = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().substring(0, 2).toLowerCase())
      .find((lang) => isSupportedLocale(lang))

    if (browserLocale && isSupportedLocale(browserLocale)) {
      return browserLocale
    }
  }

  // 3. Fallback to Dutch
  return DEFAULT_LOCALE
}

export async function setUserLocale(locale: SupportedLocale) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
}
