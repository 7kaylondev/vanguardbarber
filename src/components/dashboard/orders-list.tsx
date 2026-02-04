'use client'

import { useState } from "react"
import { format } from "date-fns"
import { ShoppingBag, Store, Truck, Check, X, Clock, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateOrderStatus } from "@/app/(main)/dashboard/actions"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Order {
    id: string
    client_name: string
    client_phone: string
    items: any[]
    total: number
    status: string
    delivery_type: string
    address?: string
    created_at: string
}

export function OrdersList({ initialOrders }: { initialOrders: Order[] }) {
    const [orders, setOrders] = useState(initialOrders)

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        const loadingToast = toast.loading("Atualizando...")

        try {
            const res = await updateOrderStatus(orderId, newStatus)
            if (res?.error) throw new Error(res.error)

            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
            toast.success(`Pedido atualizado para ${getStatusLabel(newStatus)}`)
        } catch (err) {
            toast.error("Erro ao atualizar status.")
            console.error(err)
        } finally {
            toast.dismiss(loadingToast)
        }
    }

    const getStatusLabel = (s: string) => {
        switch (s) {
            case 'pending': return 'Pendente'
            case 'confirmed': return 'Confirmado'
            case 'preparing': return 'Preparando'
            case 'ready': return 'Pronto'
            case 'delivered': return 'Entregue'
            case 'completed': return 'Concluído'
            case 'canceled': return 'Cancelado'
            default: return s
        }
    }

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'pending': return 'text-yellow-500 bg-yellow-900/10 border-yellow-900/30'
            case 'confirmed': return 'text-blue-500 bg-blue-900/10 border-blue-900/30'
            case 'completed': return 'text-green-500 bg-green-900/10 border-green-900/30'
            case 'delivered': return 'text-green-500 bg-green-900/10 border-green-900/30'
            case 'canceled': return 'text-red-500 bg-red-900/10 border-red-900/30'
            default: return 'text-zinc-500 bg-zinc-900/10 border-zinc-900/30'
        }
    }

    return (
        <div className="space-y-4">
            {orders.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">
                    <ShoppingBag className="mx-auto h-12 w-12 opacity-20 mb-4" />
                    Nenhum pedido encontrado.
                </div>
            ) : (
                <div className="grid gap-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-col md:flex-row justify-between gap-4 hover:border-zinc-700 transition-all">

                            {/* INFO */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2 py-1 rounded border font-bold uppercase ${getStatusColor(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                    <span className="text-zinc-500 text-xs flex items-center gap-1">
                                        <Clock size={12} /> {format(new Date(order.created_at), 'dd/MM HH:mm')}
                                    </span>
                                </div>

                                <h3 className="text-white font-bold">{order.client_name}</h3>
                                <p className="text-zinc-400 text-sm flex items-center gap-2">
                                    {order.delivery_type === 'delivery' ? <Truck size={14} className="text-blue-500" /> : <Store size={14} className="text-orange-500" />}
                                    {order.delivery_type === 'delivery' ? 'Entrega' : 'Retirada'}
                                    {order.address && <span className="text-zinc-600 truncate max-w-[200px]">- {order.address}</span>}
                                </p>

                                <div className="text-sm text-zinc-500 mt-2 bg-black/20 p-2 rounded">
                                    {order.items?.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between">
                                            <span>{item.name}</span>
                                            <span className="text-zinc-600">R$ {item.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex flex-col md:items-end gap-2 w-full md:w-auto md:min-w-[150px] shrink-0 border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0 border-zinc-800">
                                <div className="text-lg font-bold text-[#d4af37] flex justify-between md:block">
                                    <span className="md:hidden text-zinc-500 text-sm font-normal">Total:</span> R$ {order.total.toFixed(2)}
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300">
                                            <span className="md:hidden">Gerenciar</span>
                                            <span className="hidden md:inline">Alterar Status</span>
                                            <ChevronDown size={14} className="ml-2" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-[#111] border-zinc-800 text-zinc-300">
                                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'confirmed')} className="hover:bg-zinc-800 cursor-pointer text-blue-500 font-bold">Confirmar</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'completed')} className="hover:bg-zinc-800 cursor-pointer text-green-500 font-bold">Concluir (Entregue)</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'canceled')} className="hover:bg-zinc-800 cursor-pointer text-red-500">Cancelar</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
