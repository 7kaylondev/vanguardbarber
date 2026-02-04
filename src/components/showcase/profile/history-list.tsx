"use client"

import { Calendar, Clock } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface HistoryListProps {
    appointments: any[]
}

export function HistoryList({ appointments }: HistoryListProps) {
    if (!appointments || appointments.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className="text-zinc-500 text-sm">Nenhum agendamento encontrado.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-2">Histórico</h3>
            <div className="space-y-3">
                {appointments.map(app => (
                    <div key={app.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex justify-between items-center">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-white font-medium">
                                <Calendar size={14} className="text-[#d4af37]" />
                                {format(new Date(app.date), "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <Clock size={14} />
                                {app.time.substring(0, 5)}
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">
                                {app.products_v2?.name || 'Serviço'} • {app.professionals?.name || 'Profissional'}
                            </div>
                        </div>
                        <div>
                            <span className={`text-xs px-2 py-1 rounded capitalize border ${app.status === 'confirmed'
                                    ? 'bg-green-900/20 text-green-400 border-green-900/30'
                                    : app.status === 'canceled'
                                        ? 'bg-red-900/20 text-red-400 border-red-900/30'
                                        : 'bg-yellow-900/20 text-yellow-400 border-yellow-900/30'
                                }`}>
                                {app.status === 'confirmed' ? 'Concluído' : app.status === 'canceled' ? 'Cancelado' : 'Pendente'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
