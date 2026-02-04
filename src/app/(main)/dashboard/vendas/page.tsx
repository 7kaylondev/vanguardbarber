
import { BarChart3 } from "lucide-react"

export default function SalesPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-serif text-[#d4af37]">Relatório de Vendas</h1>

            {/* Placeholder Content */}
            <div className="bg-[#050505] border border-[#d4af37]/20 rounded-xl p-8 text-center space-y-4">
                <div className="h-16 w-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto">
                    <BarChart3 className="text-[#d4af37] h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-white">Performance Financeira</h2>
                <p className="text-gray-400 max-w-md mx-auto">
                    Acompanhe seu faturamento diário, semanal e mensal.
                </p>
                {/* TODO: Implementar lógica de fetch de dados do Supabase e renderização da interface. */}
            </div>
        </div>
    )
}
