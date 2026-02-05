"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2, Plus, Trash2, ShoppingCart, Search, CreditCard, User, Box } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { getShopServices, getShopProducts, addAppointmentItems } from "@/app/(main)/dashboard/actions"

interface AppointmentItemsDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    appointmentId: string
    shopSlug: string
    shopId: string
    onSuccess?: () => void
}

interface CatalogItem {
    id: string
    name: string
    price: number
    type: 'service' | 'product'
}

interface CartItem extends CatalogItem {
    quantity: number
}

export function AppointmentItemsDialog({
    isOpen,
    onOpenChange,
    appointmentId,
    shopSlug,
    shopId,
    onSuccess
}: AppointmentItemsDialogProps) {
    const [cart, setCart] = useState<CartItem[]>([])
    const [catalog, setCatalog] = useState<CatalogItem[]>([])
    const [isLoadingData, setIsLoadingData] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // Load Catalog
    useEffect(() => {
        if (isOpen && shopSlug) {
            setIsLoadingData(true)
            Promise.all([
                getShopServices(shopSlug),
                getShopProducts(shopId)
            ]).then(([services, products]) => {
                const normalizedServices = (services || []).map((s: any) => ({ ...s, type: 'service' }))
                const normalizedProducts = (products || []).map((p: any) => ({ ...p, type: 'product' }))
                const combined = [...normalizedServices, ...normalizedProducts]
                // Dedupe
                const uniqueCatalog = Array.from(new Map(combined.map(item => [item.id, item])).values())
                setCatalog(uniqueCatalog)
            }).finally(() => setIsLoadingData(false))
        }
    }, [isOpen, shopSlug, shopId])

    const filteredCatalog = useMemo(() => {
        if (!searchQuery) return catalog
        const lower = searchQuery.toLowerCase()
        return catalog.filter(item => item.name.toLowerCase().includes(lower))
    }, [catalog, searchQuery])

    const addToCart = (item: CatalogItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id)
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
            }
            return [...prev, { ...item, quantity: 1 }]
        })
        toast.success(`${item.name} adicionado ao pedido!`)
    }

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(i => i.id !== id))
    }

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    const handleSave = async () => {
        if (cart.length === 0) return

        setIsSaving(true)
        try {
            const result = await addAppointmentItems(appointmentId, cart)
            if (result.error) throw new Error(result.error)

            toast.success("Itens adicionados com sucesso!")
            setCart([])
            onSuccess?.()
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSaving(false)
        }
    }

    const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Box className="text-[#d4af37]" />
                        Adicionar Itens ao Agendamento
                    </DialogTitle>
                    <DialogDescription>
                        Inclua bebidas, produtos ou serviços extras.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Buscar itens..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-[#d4af37]"
                        />
                    </div>

                    {/* Catalog List */}
                    <div className="border border-zinc-800 rounded-md h-[200px] overflow-y-auto bg-zinc-900/50 p-2 space-y-1">
                        {isLoadingData ? (
                            <div className="flex justify-center items-center h-full text-zinc-500 text-sm">Carregando...</div>
                        ) : filteredCatalog.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-zinc-500 text-sm">Nenhum item encontrado.</div>
                        ) : (
                            filteredCatalog.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => addToCart(item)}
                                    className="w-full flex justify-between items-center p-2 hover:bg-zinc-800 rounded text-left transition-colors group"
                                >
                                    <div>
                                        <div className="text-sm font-medium text-zinc-300 group-hover:text-white">{item.name}</div>
                                        <div className="text-xs text-zinc-600 capitalize">{item.type === 'product' ? 'Produto' : 'Serviço'}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-[#d4af37]">{fmt(item.price)}</span>
                                        <Plus size={14} className="text-zinc-500 group-hover:text-white" />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Cart Section */}
                    {cart.length > 0 && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Pedido Atual</h4>
                            <div className="space-y-2 max-h-[150px] overflow-y-auto">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between items-center bg-zinc-950 p-2 rounded border border-zinc-900">
                                        <div className="text-sm">
                                            <span className="text-white">{item.quantity}x</span> {item.name}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-zinc-400">{fmt(item.price * item.quantity)}</span>
                                            <button onClick={() => removeFromCart(item.id)} className="text-zinc-600 hover:text-red-500">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
                                <span className="text-sm text-zinc-400">Total Adicional</span>
                                <span className="text-lg font-bold text-[#d4af37]">{fmt(total)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button
                        onClick={handleSave}
                        disabled={cart.length === 0 || isSaving}
                        className="bg-[#d4af37] text-black hover:bg-[#b5952f]"
                    >
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Itens
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
