"use client"

import { useState, useEffect, useMemo } from "react"
import { Check, DollarSign, Loader2, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateAppointmentStatus, getShopProducts } from "@/app/(main)/dashboard/actions"
import { toast } from "sonner"

interface CompleteAppointmentDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    appointment: any
    onSuccess: () => void
}

export function CompleteAppointmentDialog({
    isOpen,
    onOpenChange,
    appointment,
    onSuccess
}: CompleteAppointmentDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [servicePrice, setServicePrice] = useState<string>("0")

    // POS State
    const [availableProducts, setAvailableProducts] = useState<any[]>([])
    const [selectedProductId, setSelectedProductId] = useState<string>("")
    const [cart, setCart] = useState<{ id: string, name: string, price: number, quantity: number }[]>([])

    useEffect(() => {
        if (isOpen && appointment) {
            // Reset state
            setServicePrice(
                appointment?.price?.toString() ||
                appointment?.products_v2?.price?.toString() ||
                "0"
            )
            setCart([])
            setSelectedProductId("")

            // Fetch Products
            if (appointment.barbershop_id) {
                getShopProducts(appointment.barbershop_id).then((products) => {
                    setAvailableProducts(products || [])
                })
            }
        }
    }, [isOpen, appointment])

    const handleAddProduct = () => {
        if (!selectedProductId) return

        const product = availableProducts.find(p => p.id === selectedProductId)
        if (!product) return

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, { id: product.id, name: product.name, price: Number(product.price), quantity: 1 }]
        })

        setSelectedProductId("") // Reset selection
    }

    const handleRemoveProduct = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id))
    }

    const productsTotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    }, [cart])

    const finalTotal = useMemo(() => {
        const svc = parseFloat(servicePrice.replace(',', '.') || "0")
        return svc + productsTotal
    }, [servicePrice, productsTotal])

    const handleComplete = async () => {
        setIsLoading(true)
        try {
            // Note: We are saving the TOTAL price (Service + Products) as the appointment price for now, 
            // OR we should save them separately? 
            // The request says "Total = Serviço + Produtos".
            // And we save items in appointment_products.

            const result = await updateAppointmentStatus({
                appointmentId: appointment.id,
                status: 'completed',
                price: finalTotal, // Saving the consolidated total revenue
                products: cart
            })

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success("Atendimento concluído e venda registrada!")
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            toast.error("Erro ao concluir atendimento")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Check size={18} className="text-green-500" />
                        Concluir Atendimento
                    </DialogTitle>
                    <DialogDescription>
                        Revise os valores e adicione produtos consumidos.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* INFO CLIENTE */}
                    <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                        <div>
                            <p className="text-xs text-zinc-400">Cliente</p>
                            <p className="font-medium text-sm">{appointment?.client_name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-zinc-400">Serviço</p>
                            <p className="font-medium text-sm text-zinc-200">{appointment?.products_v2?.name || "Serviço"}</p>
                        </div>
                    </div>

                    {/* VALOR SERVIÇO */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Valor do Serviço (R$)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                value={servicePrice}
                                onChange={(e) => setServicePrice(e.target.value)}
                                className="pl-9 bg-zinc-900 border-zinc-800 text-white focus:border-[#d4af37]"
                                type="number"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* CONSUMO / PRODUTOS */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <ShoppingBag size={16} className="text-purple-400" />
                            <h4 className="text-sm font-medium text-zinc-300">Consumo / Adicionais</h4>
                        </div>

                        <div className="flex gap-2">
                            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100 h-10">
                                    <SelectValue placeholder="Selecione um produto..." />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[300px]">
                                    {/* RETAIL PRODUCTS */}
                                    {availableProducts.filter(p => p.category === 'retail' || !p.category).length > 0 && (
                                        <div className="mb-2">
                                            <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                                🧴 Produtos (Varejo)
                                            </div>
                                            {availableProducts.filter(p => p.category === 'retail' || !p.category).map(p => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.name} - R$ {Number(p.price).toFixed(2)}
                                                </SelectItem>
                                            ))}
                                        </div>
                                    )}

                                    {/* BAR PRODUCTS */}
                                    {availableProducts.filter(p => p.category === 'bar').length > 0 && (
                                        <div>
                                            <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-t border-zinc-800 mt-2 pt-2">
                                                🍺 Bar & Copa
                                            </div>
                                            {availableProducts.filter(p => p.category === 'bar').map(p => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.name} - R$ {Number(p.price).toFixed(2)}
                                                </SelectItem>
                                            ))}
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleAddProduct}
                                size="icon"
                                className="bg-zinc-800 hover:bg-zinc-700 text-white shrink-0"
                                disabled={!selectedProductId}
                            >
                                <Plus size={18} />
                            </Button>
                        </div>

                        {/* CART LIST */}
                        {cart.length > 0 && (
                            <div className="rounded-md border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-2 text-sm border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-zinc-800 text-zinc-300 text-xs px-1.5 py-0.5 rounded-full font-mono">
                                                {item.quantity}x
                                            </span>
                                            <span>{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-zinc-400">
                                                R$ {(item.price * item.quantity).toFixed(2)}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveProduct(item.id)}
                                                className="text-red-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="p-2 bg-zinc-900/80 flex justify-between items-center text-xs text-purple-300 border-t border-zinc-800 font-medium">
                                    <span>Total Adicionais</span>
                                    <span>R$ {productsTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* TOTAL FINAL */}
                    <div className="pt-4 border-t border-zinc-800">
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Total Final</span>
                            <span className="text-2xl font-bold text-[#d4af37]">
                                <span className="text-base font-normal text-zinc-500 mr-1">R$</span>
                                {finalTotal.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleComplete}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar e Concluir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
