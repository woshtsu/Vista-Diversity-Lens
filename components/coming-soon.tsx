interface ComingSoonProps {
  title: string
}

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-12 text-center">
      <div className="text-6xl mb-4">🚧</div>
      <h1 className="text-2xl font-bold text-stone-800 mb-2">{title}</h1>
      <p className="text-stone-600">Próximamente</p>
      <p className="text-sm text-stone-500 mt-2">Esta sección estará disponible en futuras actualizaciones</p>
    </div>
  )
}
