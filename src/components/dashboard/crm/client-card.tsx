
"use client"

import { format, differenceInDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MessageCircle, Calendar, Edit, Archive, History, Phone, Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Client {
    id: string
    name: string
    phone: string
    photo_url?: string | null
    profiles?: { avatar_url?: string | null } | { avatar_url?: string | null }[] | null
    created_at: string
    agendamentos: {
        id: string
        date: string
        time: string
        status: string
        price?: number
        service_name?: string
        products_v2?: {
            name: string
            price?: number
        } | { name: string, price?: number }[] | null
    }[]
}

interface ClientCardProps {
    client: Client
    status: 'novo' | 'recorrente' | 'inativo'
    isVip?: boolean
    source?: 'app' | 'manual'
    onEdit: (client: Client) => void
    onSchedule: (client: Client) => void
    onArchive?: (client: Client) => void
    onHistory: (client: Client) => void
}

import { AvatarImage } from "@/components/ui/avatar"

export function ClientCard({ client, status, isVip, source, onEdit, onSchedule, onArchive, onHistory }: ClientCardProps) {
    // Metrics
    const appointments = client.agendamentos || []
    const totalVisits = appointments.length

    const dates = appointments.map(a => new Date(a.date).getTime())
    const lastDate = dates.length > 0 ? new Date(Math.max(...dates)) : null
    const daysSinceLast = lastDate ? differenceInDays(new Date(), lastDate) : null

    // WhatsApp Message
    const handleWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation()
        const cleanPhone = client.phone.replace(/\D/g, '')

        let message = ""
        if (status === 'novo') {
            message = `Olá ${client.name}! 👋 Tudo bem? Passando para agradecer sua visita. Quando quiser voltar, é só chamar!`
        } else if (status === 'recorrente') {
            message = `Fala ${client.name}! 👊 Tudo certo? Bora agendar aquele corte para manter o visual?`
        } else {
            message = `Oi ${client.name}, sumido! 😅 Já faz uns ${daysSinceLast} dias do seu último corte. Bora renovar o visual essa semana?`
        }

        const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    // Colors based on status
    const statusColors = {
        novo: 'border-blue-900/30 hover:border-blue-500/50 bg-blue-950/10',
        recorrente: 'border-green-900/30 hover:border-green-500/50 bg-green-950/10',
        inativo: 'border-red-900/30 hover:border-red-500/50 bg-red-950/10'
    }

    const badgeColors = {
        novo: 'bg-blue-900/30 text-blue-400',
        recorrente: 'bg-green-900/30 text-green-400',
        inativo: 'bg-red-900/30 text-red-400'
    }

    const labels = {
        novo: 'Primeira Visita',
        recorrente: 'Cliente Fiel',
        inativo: 'Inativo'
    }

    return (
        <div className={cn(
            "group relative p-4 rounded-xl border transition-all duration-300 hover:shadow-lg bg-[#111]",
            statusColors[status]
        )}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-zinc-800">
                        {/* Single Source of Truth: Profile Image First, then Legacy Client Image */}
                        {(Array.isArray(client.profiles) ? client.profiles[0]?.avatar_url : client.profiles?.avatar_url) ? (
                            <AvatarImage src={(Array.isArray(client.profiles) ? client.profiles[0]?.avatar_url : client.profiles?.avatar_url)!} />
                        ) : client.photo_url ? (
                            <AvatarImage src={client.photo_url} />
                        ) : null}

                        <AvatarFallback className="bg-zinc-900 text-[#d4af37] font-bold">
                            {client.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                        <h3 className="font-bold text-white truncate max-w-[140px]" title={client.name}>
                            {client.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <Phone size={10} /> {client.phone}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                        badgeColors[status]
                    )}>
                        {labels[status]}
                    </span>
                    <div className="flex gap-1">
                        {isVip && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#d4af37] text-black animate-pulse">
                                VIP
                            </span>
                        )}
                        {source === 'app' && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300">
                                APP
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
                    <span className="text-[10px] text-zinc-500 block uppercase">Visitas</span>
                    <div className="flex items-center gap-1 text-zinc-200 font-bold">
                        <Scissors size={12} className="text-[#d4af37]" />
                        {totalVisits}
                    </div>
                </div>
                <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
                    <span className="text-[10px] text-zinc-500 block uppercase">Última</span>
                    <div className="flex items-center gap-1 text-zinc-200 font-bold">
                        <History size={12} className="text-[#d4af37]" />
                        {daysSinceLast !== null ? `${daysSinceLast}d` : '-'}
                    </div>
                </div>

                {/* NEW: Financial Metrics (LTV & Ticket) */}
                <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
                    <span className="text-[10px] text-zinc-500 block uppercase">LTV (Total)</span>
                    <div className="flex items-center gap-1 text-green-400 font-bold text-xs">
                        R$ {appointments.reduce((acc, curr) => acc + (curr.price || (curr.products_v2 as any)?.price || 0), 0).toFixed(0)}
                    </div>
                </div>

                {/* NEW: Next Action Recommendation */}
                <div className={cn(
                    "p-2 rounded border flex flex-col justify-center",
                    daysSinceLast && daysSinceLast > 20 ? "bg-red-950/20 border-red-900/30" : "bg-zinc-900/50 border-zinc-800/50"
                )}>
                    <span className="text-[10px] text-zinc-500 block uppercase">Sugestão</span>
                    <div className="text-[10px] font-bold leading-tight">
                        {daysSinceLast && daysSinceLast > 30 ? (
                            <span className="text-red-400 flex items-center gap-1">🚨 Risco! Reativar</span>
                        ) : daysSinceLast && daysSinceLast > 15 ? (
                            <span className="text-yellow-400 flex items-center gap-1">📅 Reagendar</span>
                        ) : (
                            <span className="text-zinc-400">✅ Em dia</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions (Hover Reveal or Always Visible? Always visible is better for mobile/usability) */}
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-8 text-xs bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37] hover:text-black font-bold"
                    onClick={(e) => {
                        e.stopPropagation()
                        onSchedule(client)
                    }}
                >
                    <Calendar size={14} className="mr-1.5" /> Agendar
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-green-500 hover:bg-green-950/30"
                    onClick={handleWhatsApp}
                    title="WhatsApp"
                >
                    <MessageCircle size={16} />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                    onClick={(e) => {
                        e.stopPropagation()
                        onEdit(client)
                    }}
                    title="Editar"
                >
                    <Edit size={16} />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-blue-400 hover:bg-blue-950/30"
                    onClick={(e) => {
                        e.stopPropagation()
                        onHistory(client)
                    }}
                    title="Histórico"
                >
                    <History size={16} />
                </Button>
            </div>
        </div>
    )
}
