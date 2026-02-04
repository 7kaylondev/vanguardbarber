
"use client"

import { AlertTriangle, TrendingUp, TrendingDown, Diamond } from "lucide-react"

interface CRMAlertsProps {
    metrics: {
        vipAtRisk: number
        totalVips: number
        avgTicket: number
    }
}

export function CRMAlerts({ metrics }: CRMAlertsProps) {
    if (metrics.vipAtRisk === 0 && metrics.avgTicket > 0) return null // Clean dash if all good

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {metrics.vipAtRisk > 0 && (
                <div className="bg-red-950/30 border border-red-900/50 p-3 rounded-lg flex items-center gap-3">
                    <div className="bg-red-900/20 p-2 rounded-full">
                        <AlertTriangle size={18} className="text-red-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-red-200">Atenção Necessária</h4>
                        <p className="text-xs text-red-400/80">
                            {metrics.vipAtRisk} clientes VIP sem agendar há 30+ dias.
                        </p>
                    </div>
                </div>
            )}

            {metrics.totalVips > 0 && (
                <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 p-3 rounded-lg flex items-center gap-3">
                    <div className="bg-[#d4af37]/10 p-2 rounded-full">
                        <Diamond size={18} className="text-[#d4af37]" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-[#d4af37]">Segmento VIP</h4>
                        <p className="text-xs text-[#d4af37]/80">
                            {metrics.totalVips} clientes representam 20% do faturamento.
                        </p>
                    </div>
                </div>
            )}

            {metrics.avgTicket > 0 && (
                <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg flex items-center gap-3">
                    <div className="bg-green-900/10 p-2 rounded-full">
                        <TrendingUp size={18} className="text-green-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-zinc-200">Ticket Médio Geral</h4>
                        <p className="text-xs text-zinc-400">
                            R$ {metrics.avgTicket.toFixed(2)} por visita.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
