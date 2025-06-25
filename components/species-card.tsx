import { Badge } from "@/components/ui/badge"

export function SpeciesCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Species Image */}
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
            <div className="text-white text-4xl">🦙</div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-stone-800 text-white text-xs px-2 py-1 rounded">#1</div>
        </div>

        {/* Species Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-stone-800">Llama</h2>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
              Especie de la semana
            </Badge>
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          </div>

          <div className="mb-2">
            <span className="text-3xl font-bold text-stone-800">102</span>
            <span className="text-stone-600 ml-2">unidades</span>
          </div>

          <p className="text-stone-600 text-sm">Último conteo registrado de población en la región Junín</p>
        </div>
      </div>
    </div>
  )
}
