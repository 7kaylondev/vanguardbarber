
import { Info } from "lucide-react"

interface CRMHeaderProps {
    inactivityThreshold: number
}

export function CRMHeader({ inactivityThreshold }: CRMHeaderProps) {
    return (
        <div className="bg-[#111] border border-zinc-800 rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#d4af37] font-serif mb-2">Gestão de Clientes</h1>
                    <p className="text-zinc-400 max-w-2xl">
                        Aqui sua base é organizada por <strong>comportamento</strong>.
                        Entenda quem está chegando, quem é fiel e quem precisa de atenção.
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-blue-900/20 border border-blue-900/30 px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-blue-200">Novos: 1ª visita</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-900/20 border border-green-900/30 px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-green-200">Recorrentes: 3 visitas ou +</span>
                    </div>
                    <div className="flex items-center gap-2 bg-red-900/20 border border-red-900/30 px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="text-red-200">Inativos: +{inactivityThreshold} dias sumidos</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
