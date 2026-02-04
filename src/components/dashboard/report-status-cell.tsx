"use client"

import { useState } from "react"
import { updateAppointmentStatus, updateOrderStatus } from "@/app/(main)/dashboard/actions"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { ChevronDown, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ReportStatusCellProps {
    id: string
    type: 'appointment' | 'order'
    currentStatus: string
}

export function ReportStatusCell({ id, type, currentStatus }: ReportStatusCellProps) {
    const [status, setStatus] = useState(currentStatus)
    const [loading, setLoading] = useState(false)

    const handleStatusChange = async (newStatus: string) => {
        setLoading(true)
        const loadingToast = toast.loading("Atualizando status...")

        try {
            let res
            if (type === 'appointment') {
                res = await updateAppointmentStatus({ appointmentId: id, status: newStatus as any })
            } else {
                res = await updateOrderStatus({ orderId: id, status: newStatus as any })
            }

            if (res?.error) throw new Error(res.error)

            setStatus(newStatus)
            toast.success("Status atualizado!")
        } catch (error) {
            console.error(error)
            toast.error("Erro ao atualizar status.")
        } finally {
            toast.dismiss(loadingToast)
            setLoading(false)
        }
    }

    const getStatusColor = (s: string) => {
        if (['completed', 'delivered'].includes(s)) return 'bg-blue-900/20 text-blue-500 hover:bg-blue-900/30'
        if (['confirmed', 'ready'].includes(s)) return 'bg-green-900/20 text-green-500 hover:bg-green-900/30'
        if (['canceled'].includes(s)) return 'bg-red-900/20 text-red-500 hover:bg-red-900/30'
        return 'bg-yellow-900/20 text-yellow-500 hover:bg-yellow-900/30'
    }

    const getStatusLabel = (s: string) => {
        switch (s) {
            case 'pending': return 'Pendente'
            case 'confirmed': return 'Confirmado'
            case 'completed': return 'Concluído'
            case 'canceled': return 'Cancelado'
            case 'preparing': return 'Preparando'
            case 'ready': return 'Pronto'
            case 'delivered': return 'Entregue'
            default: return s
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 text-[10px] px-2 py-1 rounded font-bold uppercase ${getStatusColor(status)}`}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : getStatusLabel(status)}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#111] border-zinc-800 text-zinc-300">
                {type === 'appointment' ? (
                    <>
                        <DropdownMenuItem onClick={() => handleStatusChange('confirmed')} className="text-green-500 font-bold hover:bg-zinc-800 cursor-pointer">Confirmar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('completed')} className="text-blue-500 font-bold hover:bg-zinc-800 cursor-pointer">Concluir</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('canceled')} className="text-red-500 hover:bg-zinc-800 cursor-pointer">Cancelar</DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuItem onClick={() => handleStatusChange('confirmed')} className="text-blue-500 font-bold hover:bg-zinc-800 cursor-pointer">Confirmar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('preparing')} className="text-yellow-500 hover:bg-zinc-800 cursor-pointer">Preparando</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('ready')} className="text-orange-500 hover:bg-zinc-800 cursor-pointer">Pronto</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('completed')} className="text-green-500 font-bold hover:bg-zinc-800 cursor-pointer">Entregue (Concluir)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('canceled')} className="text-red-500 hover:bg-zinc-800 cursor-pointer">Cancelar</DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
