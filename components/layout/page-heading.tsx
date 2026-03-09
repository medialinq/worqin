export function PageHeading({ title }: { title: string }) {
  return (
    <h1 className="text-2xl font-bold tracking-tight text-foreground">
      {title}
    </h1>
  )
}
