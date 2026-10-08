export function RoutePlaceholder({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description ? <p className="text-muted-foreground">{description}</p> : null}
      <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        Tela em construção — aguardando especificação visual do Figma. A fundação
        (rotas, query, contratos, mocks e tempo real) já está conectada.
      </p>
    </section>
  )
}
