"use client"
import { createClient } from '@/lib/supabase/client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, User, Scissors, Trash2, Pencil, MessageCircle, Check, X, DollarSign } from "lucide-react"
import { QuickSaleDialog } from "./quick-sale-dialog"
import { CompleteAppointmentDialog } from "./complete-appointment-dialog"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cancelAppointment } from "@/app/(main)/dashboard/actions"
import { toast } from "sonner"
import { EditAppointmentDialog } from "./edit-appointment-dialog"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Appointment {
    id: string
    time: string
    status: string
    date: string // needed for edit
    origin?: string
    client_name: string
    client_phone: string
    professional_id?: string // needed for edit
    products_v2?: {
        name: string
    }
    professionals?: {
        name: string
    }
    price?: number
}

interface AgendaListProps {
    initialAppointments: Appointment[]
    barbershopSlug: string
    shopId: string
}

export function AgendaList({ initialAppointments, barbershopSlug, shopId }: AgendaListProps) {
    const router = useRouter()
    const [appointments, setAppointments] = useState(initialAppointments)
    const [isCancelling, setIsCancelling] = useState<string | null>(null)
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
    const [completingAppointment, setCompletingAppointment] = useState<Appointment | null>(null)
    const [sellingAppointment, setSellingAppointment] = useState<Appointment | null>(null)


    // Sync state if props change (revalidation from router.refresh())
    useEffect(() => { setAppointments(initialAppointments) }, [initialAppointments])

    // REALTIME SUBSCRIPTION
    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel('realtime-agendamentos')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'agendamentos' }, (payload) => {
                console.log('[Realtime] Mudança detectada:', payload)
                router.refresh()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [router])

    const handleWhatsappClick = (app: Appointment) => {
        const cleanPhone = app.client_phone.replace(/\D/g, '')
        const [year, month, day] = app.date.split('-').map(Number)
        const dateObj = new Date(year, month - 1, day, 12, 0, 0)
        const formattedDate = format(dateObj, "dd/MM/yyyy", { locale: ptBR })

        const message = `Olá ${app.client_name}! 👋
Recebemos seu agendamento para ${app.products_v2?.name || 'Serviço'}
📅 Data: ${formattedDate}
⏰ Horário: ${app.time.substring(0, 5)}
Está tudo confirmado. Qualquer coisa é só chamar 💈✂️`
        const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    const handleCancel = async (id: string) => {
        try {
            setIsCancelling(id)
            // Optimistic Update: Move to cancelled
            const previousAppointments = [...appointments]
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'canceled' } : a))

            const result = await cancelAppointment(id)

            if (!result?.success) {
                setAppointments(previousAppointments)
                toast.error("Erro ao cancelar agendamento")
                return
            }
            toast.success("Agendamento cancelado")
            router.refresh()
        } catch (error) {
            toast.error("Erro ao cancelar")
        } finally {
            setIsCancelling(null)
        }
    }

    // SEGMENTATION
    const upcoming = appointments.filter(a => ['confirmed', 'pending'].includes(a.status))
    const completed = appointments.filter(a => a.status === 'completed')
    const canceled = appointments.filter(a => a.status === 'canceled')

    const renderCard = (app: Appointment) => (
        <div key={app.id} className="relative group mb-4 pl-8">
            {/* Dot */}
            <div
                className={`absolute -left-[11px] top-4 h-5 w-5 rounded-full border-4 border-[#111] z-10 ${app.status === "confirmed" ? "bg-green-500" :
                    app.status === "completed" ? "bg-blue-500" :
                        app.status === "canceled" ? "bg-red-500" :
                            "bg-[#d4af37]"
                    }`}
            />

            {/* Vertical Line Connector */}
            <div className="absolute left-[0px] top-0 bottom-0 w-[2px] bg-zinc-800" />

            {/* Card */}
            <div className={`bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg hover:border-[#d4af37]/50 transition-colors relative ${app.status === 'canceled' ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-white font-mono">{app.time.substring(0, 5)}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${app.status === "confirmed" ? "bg-green-900/20 text-green-500" :
                            app.status === "completed" ? "bg-blue-900/20 text-blue-500" :
                                app.status === "canceled" ? "bg-red-900/20 text-red-500" :
                                    "bg-yellow-900/20 text-yellow-500"
                            }`}>
                            {app.status === 'confirmed' ? 'Confirmado' : app.status === 'completed' ? 'Concluído' : app.status === 'canceled' ? 'Cancelado' : 'Pendente'}
                        </span>
                        {app.origin === "site" && <span className="text-[10px] bg-blue-900/20 text-blue-400 px-2 py-0.5 rounded">CRM</span>}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        {['confirmed', 'pending'].includes(app.status) && (
                            <Button
                                variant="ghost" size="icon"
                                className="h-8 w-8 text-zinc-500 hover:text-blue-500 hover:bg-zinc-800"
                                onClick={() => setCompletingAppointment(app)}
                                title="Concluir Atendimento"
                            >
                                <Check size={16} />
                            </Button>
                        )}
                        <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-zinc-500 hover:text-green-500 hover:bg-zinc-800"
                            onClick={() => handleWhatsappClick(app)}
                        >
                            <MessageCircle size={16} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-green-500 hover:bg-zinc-800" onClick={() => setSellingAppointment(app)}>
                            <DollarSign size={16} />
                        </Button>

                        <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-zinc-500 hover:text-[#d4af37] hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent"
                            onClick={() => app.status !== 'completed' && setEditingAppointment(app)}
                            disabled={app.status === 'completed'}
                        >
                            <Pencil size={16} />
                        </Button>

                        {app.status !== 'canceled' && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-zinc-800" disabled={isCancelling === app.id}>
                                        <Trash2 size={16} />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-zinc-400">
                                            Tem certeza que deseja cancelar este agendamento?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300">Voltar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleCancel(app.id)} className="bg-red-900 text-red-100 hover:bg-red-800 border border-red-800">
                                            Sim, cancelar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 text-white font-bold">
                        <User size={16} className="text-[#d4af37]" />
                        {app.client_name}
                    </div>
                    <div className="text-sm text-zinc-500">{app.client_phone}</div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-zinc-300">
                        <Scissors size={14} />
                        {app.products_v2?.name || "Serviço"}
                    </div>
                    {app.professionals && (
                        <div className="flex items-center gap-2 text-zinc-400">
                            <User size={14} />
                            Pro: {app.professionals.name}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    if (appointments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500 space-y-4">
                <Calendar size={48} className="text-zinc-700" />
                <p>Nenhum agendamento para hoje.</p>
                <Button variant="outline" className="border-zinc-700" onClick={() => router.push('/dashboard/agendamentos')}>Ver Agenda Completa</Button>
            </div>
        )
    }

    return (
        <div className="space-y-8 pl-4 py-2">

            {/* UPCOMING */}
            <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Agendados ({upcoming.length})
                </h3>
                {upcoming.length > 0 ? upcoming.map(renderCard) : <p className="text-zinc-700 text-sm italic ml-8">Nenhum agendamento.</p>}
            </div>

            {/* COMPLETED */}
            {completed.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 mt-8 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Concluídos ({completed.length})
                    </h3>
                    {completed.map(renderCard)}
                </div>
            )}

            {/* CANCELED */}
            {canceled.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 mt-8 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Cancelados ({canceled.length})
                    </h3>
                    {canceled.map(renderCard)}
                </div>
            )}

            {editingAppointment && (
                <EditAppointmentDialog
                    isOpen={!!editingAppointment}
                    onOpenChange={(open) => !open && setEditingAppointment(null)}
                    appointment={editingAppointment}
                    barbershopSlug={barbershopSlug}
                // onUpdate={(updated) => ...} // ideally update local state
                />
            )}

            {completingAppointment && (
                <CompleteAppointmentDialog
                    isOpen={!!completingAppointment}
                    onOpenChange={(open) => !open && setCompletingAppointment(null)}
                    appointment={completingAppointment}
                    onSuccess={() => {
                        // Optimistic Update
                        setAppointments(prev => prev.map(a =>
                            a.id === completingAppointment.id ? { ...a, status: 'completed' } : a
                        ))
                        setCompletingAppointment(null)
                        router.refresh()
                    }}
                />
            )}

            {sellingAppointment && (
                <QuickSaleDialog
                    isOpen={!!sellingAppointment}
                    onOpenChange={(open) => !open && setSellingAppointment(null)}
                    slug={barbershopSlug}
                    shopId={shopId}
                    defaultClientName={sellingAppointment.client_name}
                />
            )}
        </div>
    )
}
