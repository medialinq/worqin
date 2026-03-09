import { BRAND } from "@/config/brand"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-app-bg px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">{BRAND.name}</h1>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
