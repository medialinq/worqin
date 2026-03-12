// Admin root layout — auth protection is handled by middleware.ts
// The (protected) sub-group applies the admin shell to all non-login routes.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
