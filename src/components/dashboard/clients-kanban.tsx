
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { differenceInDays, format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Components
import { CRMHeader } from "./crm/crm-header"
import { ClientCard } from "./crm/client-card"
import { AddClientDialog } from "./crm/add-client-dialog"
import { NewAppointmentDialog } from "./new-appointment-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CRMAlerts } from "./crm/crm-alerts"

interface Client {
    id: string
    name: string
    phone: string
    photo_url?: string | null
    auth_user_id?: string | null
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
    isVip?: boolean
    source?: 'app' | 'manual'
}

interface ClientsKanbanProps {
    clients: Client[]
    barbershopId: string
    shopSlug: string
    inactivityThreshold: number
}

export function ClientsKanban({ clients, barbershopId, shopSlug, inactivityThreshold }: ClientsKanbanProps) {
    const [searchTerm, setSearchTerm] = useState('')

    // Dialog States
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [scheduleClient, setScheduleClient] = useState<Client | null>(null) // For scheduling
    const [historyClient, setHistoryClient] = useState<Client | null>(null) // For history view
    const [editClient, setEditClient] = useState<Client | null>(null) // For editing (future)

    // Safety check
    const safeClients = clients || []

    // 1. Calculate Financials for All Clients (Memoize if needed, here simple)
    const clientsWithMetrics = safeClients.map(c => {
        const totalSpent = (c.agendamentos || []).reduce((acc, curr) => acc + (curr.price || (curr.products_v2 as any)?.price || 0), 0)
        return { ...c, totalSpent }
    })

    // 2. Determine VIP Threshold (Top 20% LTV)
    const sortedSpenders = [...clientsWithMetrics].sort((a, b) => b.totalSpent - a.totalSpent)
    const top20Index = Math.floor(sortedSpenders.length * 0.2)
    const vipThreshold = sortedSpenders.length > 5 ? sortedSpenders[top20Index]?.totalSpent || 999999 : 999999

    // Classification Logic
    const now = new Date()
    const classified = clientsWithMetrics
        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(c => c.agendamentos && c.agendamentos.length > 0) // HIDE 0 VISITS
        .reduce((acc, client) => {
            const appointments = client.agendamentos || []
            const count = appointments.length

            const dates = appointments.map(a => new Date(a.date).getTime())
            const lastDate = dates.length > 0 ? new Date(Math.max(...dates)) : null

            const daysSinceLast = lastDate ? differenceInDays(now, lastDate) : 0

            // Flags
            const isVip = client.totalSpent >= vipThreshold && client.totalSpent > 0
            const source = client.auth_user_id ? 'app' : 'manual'

            const clientWithFlags = { ...client, isVip, source }

            // Logic Official Rules:
            // Novo: 1-2 appointments
            // Recorrente: 3+ appointments
            // Inativo: Was Recurring (3+) AND > X days since last

            if (count < 3) { // 1 or 2
                acc.novos.push(clientWithFlags)
                return acc
            }

            // If we are here, count >= 3 (Potential Recurring)
            if (daysSinceLast > inactivityThreshold) {
                acc.inativos.push(clientWithFlags)
                return acc
            }

            // Else, is active recurring
            acc.recorrentes.push(clientWithFlags)
            return acc

        }, { novos: [] as any[], recorrentes: [] as any[], inativos: [] as any[] })

    // Task 7: Calculate Alert Metrics
    // VIPs at Risk (Is VIP + Inactive List OR > 30 days)
    const allVips = [...classified.novos, ...classified.recorrentes, ...classified.inativos].filter(c => c.isVip)
    const vipAtRisk = allVips.filter(c => {
        const appointments = c.agendamentos || []
        const dates = appointments.map((a: any) => new Date(a.date).getTime())
        const lastDate = dates.length > 0 ? new Date(Math.max(...dates)) : null
        const days = lastDate ? differenceInDays(now, lastDate) : 0
        return days > 30
    }).length

    const totalRevenue = clientsWithMetrics.reduce((acc, c) => acc + c.totalSpent, 0)
    const totalVisitsAll = clientsWithMetrics.reduce((acc, c) => acc + (c.agendamentos?.length || 0), 0)
    const avgTicketGlobal = totalVisitsAll > 0 ? totalRevenue / totalVisitsAll : 0

    const alertMetrics = {
        vipAtRisk,
        totalVips: allVips.length,
        avgTicket: avgTicketGlobal
    }

    const handleAction = (c: Client, action: 'edit' | 'schedule' | 'history') => {
        if (action === 'schedule') setScheduleClient(c)
        if (action === 'history') setHistoryClient(c)
        // edit not implemented yet
    }

    return (
        <div className="space-y-6">
            <CRMHeader inactivityThreshold={inactivityThreshold} />

            <CRMAlerts metrics={alertMetrics} />

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Buscar cliente por nome..."
                        className="pl-9 bg-[#111] border-zinc-800 focus:ring-[#d4af37]"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="bg-[#d4af37] text-black hover:bg-[#b5952f] font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Manual
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
                {/* COLUMN 1: NOVOS */}
                <KanbanColumn
                    title="Novos"
                    count={classified.novos.length}
                    clients={classified.novos}
                    status="novo"
                    onClientAction={(c, action) => {
                        if (action === 'schedule') setScheduleClient(c)
                        if (action === 'edit') setHistoryClient(c) // Reusing history for now as "Edit/View"
                    }}
                />

                {/* COLUMN 2: RECORRENTES */}
                <KanbanColumn
                    title="Recorrentes"
                    count={classified.recorrentes.length}
                    clients={classified.recorrentes}
                    status="recorrente"
                    onClientAction={(c, action) => {
                        if (action === 'schedule') setScheduleClient(c)
                        if (action === 'edit') setHistoryClient(c)
                    }}
                />

                {/* COLUMN 3: INATIVOS */}
                <KanbanColumn
                    title={`Inativos: +${inactivityThreshold} dias sumidos`}
                    count={classified.inativos.length}
                    clients={classified.inativos}
                    status="inativo"
                    onClientAction={(c, action) => {
                        if (action === 'schedule') setScheduleClient(c)
                        if (action === 'edit') setHistoryClient(c)
                    }}
                />
            </div>

            {/* MODALS */}
            <AddClientDialog
                isOpen={isAddOpen}
                onOpenChange={setIsAddOpen}
            />

            {/* Reuse the internal appointment dialog, pre-filling client name if possible (the component would need modification to accept initialClient, but for now user just wants the modal to open) 
                Ideally, I should pass the client name to the dialog. 
                But NewAppointmentDialog currently manages its own state. 
                I will skip prop passing for now or update NewAppointmentDialog if strict requirement, but prompt just says "Agendar novo horário". 
                I'll leave it opening the generic modal for now to keep it simple, or user can type name.
                Wait, better UX: User clicks "Schedule" on "João", modal opens with "João" filled. 
                I'll handle that later as polish if needed.
            */}
            <NewAppointmentDialog
                isOpen={!!scheduleClient}
                onOpenChange={(open) => !open && setScheduleClient(null)}
                slug={shopSlug}
                shopId={barbershopId}
                initialClientName={scheduleClient?.name}
                initialClientPhone={scheduleClient?.phone}
            />

            {/* HISTORY / DETAILS MODAL (Legacy View for now) */}
            <Dialog open={!!historyClient} onOpenChange={(open) => !open && setHistoryClient(null)}>
                <DialogContent className="bg-[#111] border-zinc-800 text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Histórico de {historyClient?.name}</DialogTitle>
                        <DialogDescription>{historyClient?.phone}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto mt-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                                <span className="text-xs text-zinc-500 block">Total de Visitas</span>
                                <span className="text-xl font-bold text-[#d4af37]">
                                    {historyClient?.agendamentos?.filter(a => a.status === 'confirmed').length || 0}
                                </span>
                            </div>
                            <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                                <span className="text-xs text-zinc-500 block">Última Visita</span>
                                <span className="text-xl font-bold text-white">
                                    {historyClient?.agendamentos?.filter(a => a.status === 'confirmed').length ?
                                        format(new Date(Math.max(...historyClient.agendamentos.filter(a => a.status === 'confirmed').map(a => new Date(a.date).getTime()))), 'dd/MM/yy')
                                        : '-'
                                    }
                                </span>
                            </div>
                        </div>

                        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Histórico Completo</h4>

                        {historyClient?.agendamentos?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(app => (
                            <div key={app.id} className="flex justify-between items-center p-3 bg-zinc-900 rounded border border-zinc-800">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm text-white">{format(new Date(app.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${app.status === 'confirmed' ? 'bg-green-900 text-green-300' : 'bg-zinc-700 text-zinc-400'}`}>
                                            {app.status === 'confirmed' ? 'Concluído' : app.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        {app.time.substring(0, 5)} - <span className="text-[#d4af37]">
                                            {(Array.isArray(app.products_v2) ? app.products_v2[0]?.name : app.products_v2?.name) || 'Serviço não ident.'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function KanbanColumn({ title, count, clients, status, onClientAction }: { title: string, count: number, clients: Client[], status: 'novo' | 'recorrente' | 'inativo', onClientAction: (c: Client, action: 'edit' | 'schedule' | 'history') => void }) {
    return (
        <div className="bg-[#050505] border border-zinc-800 rounded-xl flex flex-col h-[700px] overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/20">
                <h3 className="font-bold text-zinc-300">{title}</h3>
                <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">{count}</span>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
                {clients.map(client => (
                    <ClientCard
                        key={client.id}
                        client={client}
                        status={status}
                        isVip={client.isVip}
                        source={client.source}
                        onEdit={(c) => onClientAction(c, 'edit')}
                        onSchedule={(c) => onClientAction(c, 'schedule')}
                        onHistory={(c) => onClientAction(c, 'history')}
                    />
                ))}
                {clients.length === 0 && (
                    <p className="text-zinc-600 text-center text-xs py-8">Nenhum cliente aqui.</p>
                )}
            </div>
        </div>
    )
}
