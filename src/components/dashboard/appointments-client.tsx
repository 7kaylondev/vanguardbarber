"use client"

import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Check, DollarSign, User, Phone, Scissors, Calendar as CalendarIcon, Clock } from "lucide-react"
import { updateAppointmentStatus } from "@/app/(main)/dashboard/actions"
import { toast } from "sonner"
import { QuickSaleDialog } from "@/components/dashboard/quick-sale-dialog"
import { cn } from "@/lib/utils"

type Appointment = {
    id: string
    date: string
    time: string
    status: string
    client_name: string
    client_phone: string
    price: number | null
    created_at: string
    concluded_at: string | null
    clients: any
    professionals: any
    products_v2: any
    appointment_products: any[]
}

interface AppointmentsClientProps {
    initialAppointments: Appointment[]
    shopSlug: string
    shopId: string
}

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

// ... imports

export function AppointmentsClient({ initialAppointments, shopSlug, shopId }: AppointmentsClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const [appointments, setAppointments] = useState(initialAppointments)

    // Sync props to state (Important for router.refresh to actually update the UI)
    // When router.refresh() runs, Sever Component re-renders, passes new initialAppointments.
    // We need to update state.
    useMemo(() => {
        setAppointments(initialAppointments)
    }, [initialAppointments])

    // --- REALTIME ---
    useEffect(() => {
        const channel = supabase
            .channel('realtime-appointments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'agendamentos', filter: `barbershop_id=eq.${shopId}` }, () => {
                router.refresh()
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointment_products' }, () => {
                // Ideally filter by appointment_id belonging to shop, but table filter is limited.
                // Trigger refresh safely.
                router.refresh()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, router, shopId])

    const [isSaleOpen, setIsSaleOpen] = useState(false)
    const [selectedApptForSale, setSelectedApptForSale] = useState<Appointment | null>(null)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    // --- SORTING ---
    // 1. em_atendimento, 2. confirmed, 3. pending, 4. completed/canceled
    const statusPriority = (s: string) => {
        switch (s) {
            case 'em_atendimento': return 0
            case 'confirmed': return 1
            case 'pending': return 2
            case 'completed': return 3
            default: return 4
        }
    }

    const sortedAppointments = useMemo(() => {
        return [...appointments].sort((a, b) => {
            const pA = statusPriority(a.status)
            const pB = statusPriority(b.status)
            if (pA !== pB) return pA - pB
            // Secondary sort by time (asc for future, desc for past? usually agenda is time asc)
            return a.time.localeCompare(b.time)
        })
    }, [appointments])

    // --- ACTIONS ---
    const handleStatusUpdate = async (id: string, newStatus: 'em_atendimento' | 'completed' | 'confirmed') => {
        setLoadingId(id)
        try {
            // Optimistic Update
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))

            const res = await updateAppointmentStatus({
                appointmentId: id,
                status: newStatus
            })

            if (res?.error) throw new Error(res.error)
            toast.success("Status atualizado!")
        } catch (e: any) {
            toast.error(e.message)
            // Revert (simplified: would need refetch in real scenario or undo optimistic)
        } finally {
            setLoadingId(null)
        }
    }

    const openQuickSale = (appt: Appointment) => {
        setSelectedApptForSale(appt)
        setIsSaleOpen(true)
    }

    // --- HELPERS ---
    const formatBrlDate = (d: string) => {
        const [y, m, dDay] = d.split('-').map(Number)
        return format(new Date(y, m - 1, dDay), 'dd/MM/yyyy')
    }

    const getStatusStyle = (s: string) => {
        switch (s) {
            case 'em_atendimento': return "border-[#00ff99] bg-[#00ff99]/5 shadow-[0_0_15px_rgba(0,255,153,0.1)]"
            case 'confirmed': return "border-green-900/50 bg-green-900/10"
            case 'pending': return "border-yellow-900/50 bg-yellow-900/10"
            case 'completed': return "border-zinc-800 bg-zinc-900/50 opacity-70"
            default: return "border-zinc-800 bg-[#111]"
        }
    }

    const getStatusBadge = (s: string) => {
        switch (s) {
            case 'em_atendimento': return <Badge className="bg-[#00ff99] text-black hover:bg-[#00cc7a] animate-pulse">EM ATENDIMENTO</Badge>
            case 'confirmed': return <Badge className="bg-green-900/40 text-green-400 border-green-800">CONFIRMADO</Badge>
            case 'pending': return <Badge className="bg-yellow-900/40 text-yellow-500 border-yellow-800">PENDENTE</Badge>
            case 'completed': return <Badge className="bg-blue-900/40 text-blue-400 border-blue-800">CONCLUÍDO</Badge>
            case 'canceled': return <Badge className="bg-red-900/40 text-red-500 border-red-800">CANCELADO</Badge>
            default: return <Badge variant="outline">{s}</Badge>
        }
    }

    // --- RENDER ---
    return (
        <>
            {/* MOBILE LIST (< 768px via CSS) */}
            <div className="md:hidden space-y-4">
                {sortedAppointments.map(app => {
                    const client = Array.isArray(app.clients) ? app.clients[0] : app.clients
                    const service = Array.isArray(app.products_v2) ? app.products_v2[0] : app.products_v2
                    const pro = Array.isArray(app.professionals) ? app.professionals[0] : app.professionals

                    const isActive = app.status === 'em_atendimento'

                    return (
                        <Card key={app.id} className={cn("overflow-hidden transition-all duration-300", getStatusStyle(app.status))}>
                            <CardContent className="p-0">
                                {/* Header: Time & Status */}
                                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className={isActive ? "text-[#00ff99]" : "text-zinc-500"} />
                                        <span className={cn("text-lg font-mono font-bold", isActive ? "text-[#00ff99]" : "text-white")}>
                                            {app.time.substring(0, 5)}
                                        </span>
                                    </div>
                                    {getStatusBadge(app.status)}
                                </div>

                                {/* Main Info */}
                                <div className="p-4 relative">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-3">
                                            {/* Client */}
                                            <div>
                                                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1 uppercase tracking-wider font-bold">
                                                    <User size={12} /> Cliente
                                                </div>
                                                <p className="text-white font-medium text-lg leading-tight">
                                                    {client?.name || app.client_name || 'Sem nome'}
                                                </p>
                                                {app.client_phone && (
                                                    <div className="flex items-center gap-1.5 mt-1 text-zinc-500">
                                                        <Phone size={12} />
                                                        <span className="text-sm font-mono">{app.client_phone}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Service & Pro */}
                                            <div className="pt-2">
                                                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1 uppercase tracking-wider font-bold">
                                                    <Scissors size={12} /> Serviço
                                                </div>
                                                <p className="text-zinc-300">
                                                    {service?.name || (app.appointment_products?.length ? `${app.appointment_products.length} Itens` : 'Personalizado')}
                                                </p>
                                                <p className="text-zinc-500 text-sm mt-0.5">
                                                    com <span className="text-zinc-400">{pro?.name || 'Qualquer'}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Price - Big Right */}
                                        <div className="text-right">
                                            <div className="text-xs text-zinc-600 font-bold mb-1">VALOR</div>
                                            <div className="text-2xl font-bold text-white tracking-tight">
                                                R$ {app.price?.toFixed(2) || "0.00"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Bar */}
                                {app.status !== 'canceled' && app.status !== 'completed' && (
                                    <div className="grid grid-cols-3 gap-px bg-zinc-800/50 border-t border-white/5 overflow-hidden">
                                        {app.status !== 'em_atendimento' ? (
                                            <button
                                                onClick={() => handleStatusUpdate(app.id, 'em_atendimento')}
                                                disabled={!!loadingId}
                                                className="flex flex-col items-center justify-center gap-1 py-3 bg-[#111] hover:bg-zinc-900 active:bg-zinc-800 transition-colors text-white"
                                            >
                                                <Play size={20} fill="currentColor" className="text-white" />
                                                <span className="text-[10px] uppercase font-bold tracking-widest">Iniciar</span>
                                            </button>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center gap-1 py-3 bg-[#00ff99]/10 text-[#00ff99]">
                                                <div className="h-2 w-2 rounded-full bg-[#00ff99] animate-pulse" />
                                                <span className="text-[10px] uppercase font-bold tracking-widest">Rodando</span>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => openQuickSale(app)}
                                            className="flex flex-col items-center justify-center gap-1 py-3 bg-[#111] hover:bg-zinc-900 active:bg-zinc-800 transition-colors text-green-400"
                                        >
                                            <DollarSign size={20} />
                                            <span className="text-[10px] uppercase font-bold tracking-widest">Venda</span>
                                        </button>

                                        <button
                                            onClick={() => handleStatusUpdate(app.id, 'completed')}
                                            disabled={!!loadingId}
                                            className="flex flex-col items-center justify-center gap-1 py-3 bg-[#111] hover:bg-zinc-900 active:bg-zinc-800 transition-colors text-blue-400"
                                        >
                                            <Check size={20} />
                                            <span className="text-[10px] uppercase font-bold tracking-widest">Finalizar</span>
                                        </button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}

                {sortedAppointments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-4">
                        <CalendarIcon size={48} className="opacity-20" />
                        <p>Nenhum agendamento para este período.</p>
                    </div>
                )}
            </div>

            {/* DESKTOP TABLE (Keep Existing Logic > 768px via CSS) */}
            <div className="hidden md:block">
                <div className="bg-[#111] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#1a1a1a] text-xs uppercase text-zinc-500 font-bold border-b border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4">Horário</th>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Serviço / Detalhe</th>
                                    <th className="px-6 py-4">Profissional</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Valor</th>
                                    <th className="px-6 py-4 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {sortedAppointments.map((app) => {
                                    const client = Array.isArray(app.clients) ? app.clients[0] : app.clients
                                    const service = Array.isArray(app.products_v2) ? app.products_v2[0] : app.products_v2
                                    const pro = Array.isArray(app.professionals) ? app.professionals[0] : app.professionals

                                    return (
                                        <tr key={app.id} className="hover:bg-zinc-900/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-mono font-bold text-base bg-zinc-900 px-2 py-1 rounded w-fit border border-zinc-800 group-hover:border-[#d4af37]/50 transition-colors">
                                                        {app.time.substring(0, 5)}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 mt-1">
                                                        {formatBrlDate(app.date)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-zinc-200 font-medium text-base">
                                                        {client?.name || app.client_name || 'Cliente sem nome'}
                                                    </span>
                                                    {app.client_phone && (
                                                        <span className="text-xs text-zinc-500 font-mono tracking-wider">
                                                            {app.client_phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-zinc-300">
                                                        {service?.name || (app.appointment_products?.length ? `${app.appointment_products.length} Itens` : 'Serviço Personalizado')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-bold border border-zinc-700">
                                                        {pro?.name?.substring(0, 1) || '?'}
                                                    </div>
                                                    <span className="text-zinc-400">
                                                        {pro?.name || 'Qualquer'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(app.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-bold text-zinc-300 text-base">
                                                    R$ {app.price?.toFixed(2) ?? '0.00'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {app.status !== 'completed' && app.status !== 'canceled' && (
                                                        <>
                                                            {app.status !== 'em_atendimento' && (
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10 hover:text-white" onClick={() => handleStatusUpdate(app.id, 'em_atendimento')} title="Iniciar">
                                                                    <Play size={14} />
                                                                </Button>
                                                            )}
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-green-900/20 hover:text-green-500" onClick={() => openQuickSale(app)} title="Venda Rápida">
                                                                <DollarSign size={14} />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-blue-900/20 hover:text-blue-500" onClick={() => handleStatusUpdate(app.id, 'completed')} title="Concluir">
                                                                <Check size={14} />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <QuickSaleDialog
                isOpen={isSaleOpen}
                onOpenChange={setIsSaleOpen}
                slug={shopSlug}
                shopId={shopId}
                defaultClientName={selectedApptForSale?.client_name || ''}
                existingAppointmentId={selectedApptForSale?.id}
                currentTotal={selectedApptForSale?.price || 0}
            />
        </>
    )
}
