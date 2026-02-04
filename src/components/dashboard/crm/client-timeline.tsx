
"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TimelineEvent {
    id: string
    type: 'appointment' | 'order' | 'message'
    date: Date
    title: string
    status: string
    value?: number
    description?: string
}

interface ClientTimelineProps {
    client: any // Using any for flexibility with the complex Client type inheritance
}

export function ClientTimeline({ client }: ClientTimelineProps) {
    // 1. Unify Events (Appointments + Orders + etc)
    const appointments = client.agendamentos || []

    // Transform appointments to events
    const events: TimelineEvent[] = appointments.map((appt: any) => {
        const prodName = appt.service_name ||
            (Array.isArray(appt.products_v2) ? appt.products_v2[0]?.name : appt.products_v2?.name) ||
            "Serviço"

        const price = appt.price ||
            (Array.isArray(appt.products_v2) ? appt.products_v2[0]?.price : appt.products_v2?.price) ||
            0

        return {
            id: appt.id,
            type: 'appointment',
            date: new Date(`${appt.date}T${appt.time}`), // ISO format assumption
            title: prodName,
            status: appt.status,
            value: price,
            description: `Agendamento para ${appt.time}`
        }
    })

    // Sort Descending
    const sortedEvents = events.sort((a, b) => b.date.getTime() - a.date.getTime())

    const getIcon = (type: string, status: string) => {
        if (status === 'canceled') return <XCircle size={16} className="text-red-500" />
        if (status === 'completed' || status === 'confirmed') return <CheckCircle size={16} className="text-green-500" />
        return <Clock size={16} className="text-yellow-500" />
    }

    return (
        <div className="h-[400px] pr-4 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
            <div className="space-y-6">
                {sortedEvents.length === 0 ? (
                    <div className="text-center text-zinc-500 py-10">
                        Nenhum histórico encontrado.
                    </div>
                ) : (
                    sortedEvents.map((event, index) => (
                        <div key={event.id} className="relative pl-6 border-l border-zinc-800 last:border-0 pb-6 last:pb-0">
                            {/* Dot */}
                            <div className={`absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full border border-zinc-900 ${event.status === 'completed' ? 'bg-green-500' :
                                    event.status === 'canceled' ? 'bg-red-500' : 'bg-yellow-500'
                                }`} />

                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-zinc-500 mb-1 capitalize">
                                        {format(event.date, "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        {getIcon(event.type, event.status)}
                                        {event.title}
                                    </h4>
                                </div>

                                {event.value && event.value > 0 && (
                                    <Badge variant="outline" className="border-green-900/50 text-green-400 bg-green-950/20">
                                        R$ {event.value.toFixed(2)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
