"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2, Plus, Trash2, ShoppingCart, Search, CreditCard, User } from "lucide-react"
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
// Import Actions
import { getShopServices, getShopProducts, createQuickSale, addAppointmentItems } from "@/app/(main)/dashboard/actions"

interface QuickSaleDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    slug: string
    shopId: string
    defaultClientName?: string
    existingAppointmentId?: string // NEW: Optional ID
    currentTotal?: number // New Prop
}

interface SaleItem {
    id: string
    name: string
    price: number
    type: 'service' | 'product'
    quantity: number
}

interface CatalogItem {
    id: string
    name: string
    price: number
    type: 'service' | 'product'
}

export function QuickSaleDialog({
    isOpen,
    onOpenChange,
    slug,
    shopId,
    defaultClientName = "",
    existingAppointmentId,
    currentTotal = 0
}: QuickSaleDialogProps) {
    // Form State
    const [clientName, setClientName] = useState(defaultClientName)
    const [cart, setCart] = useState<SaleItem[]>([])

    // Update name when default changes or dialog opens
    useEffect(() => {
        if (isOpen && defaultClientName) {
            setClientName(defaultClientName)
        }
    }, [isOpen, defaultClientName])

    // Data State
    const [catalog, setCatalog] = useState<CatalogItem[]>([])
    const [isLoadingData, setIsLoadingData] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Filter Logic
    const [searchQuery, setSearchQuery] = useState("")
    const [openCombobox, setOpenCombobox] = useState(false)

    const filteredCatalog = useMemo(() => {
        if (!searchQuery) return catalog
        const lower = searchQuery.toLowerCase()
        return catalog.filter(item => item.name.toLowerCase().includes(lower))
    }, [catalog, searchQuery])

    // Fetch Data on Open
    useEffect(() => {
        if (isOpen && slug) {
            setIsLoadingData(true)
            Promise.all([
                getShopServices(slug),
                getShopProducts(shopId)
            ]).then(([services, products]) => {
                const normalizedServices = (services || []).map((s: any) => ({ ...s, type: 'service' }))
                const normalizedProducts = (products || []).map((p: any) => ({ ...p, type: 'product' }))

                // Deduplicate by ID (Services might appear in Products list depending on backend filter)
                const combined = [...normalizedServices, ...normalizedProducts]
                const uniqueCatalog = Array.from(new Map(combined.map(item => [item.id, item])).values())

                setCatalog(uniqueCatalog)
            }).catch(err => {
                console.error(err)
                toast.error("Erro ao carregar catálogo")
            }).finally(() => {
                setIsLoadingData(false)
            })
        }
    }, [isOpen, slug, shopId])

    const addToCart = (item: CatalogItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id)
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
            }
            return [...prev, { ...item, quantity: 1 }]
        })
        setOpenCombobox(false)
        setSearchQuery("") // Reset search
        toast.success(`${item.name} adicionado!`)
    }

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.id !== itemId))
    }

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => {
            return prev.map(i => {
                if (i.id === itemId) {
                    const newQty = Math.max(1, i.quantity + delta)
                    return { ...i, quantity: newQty }
                }
                return i
            })
        })
    }

    const total = useMemo(() => {
        return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    }, [cart])

    const handleConfirm = async () => {
        if (!clientName) {
            toast.warning("Informe o nome do cliente (mesmo que avulso)")
            return
        }
        if (cart.length === 0) {
            toast.warning("O carrinho está vazio")
            return
        }

        setIsSaving(true)
        const toastId = toast.loading("Registrando venda...")

        try {
            // 1. Log Payload
            const payload = {
                barbershop_id: shopId,
                client_name: clientName,
                cart_items_count: cart.length,
                total_price: total
            }
            console.log("[QuickSale] 🚀 Sending Payload:", payload)

            // 2. Timeout Promise (12s)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout: O servidor demorou muito para responder (12s).")), 12000)
            )

            // 3. Action Call
            let actionPromise

            if (existingAppointmentId) {
                // APPEND MODE
                actionPromise = addAppointmentItems(
                    existingAppointmentId,
                    cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }))
                )
            } else {
                // CREATE MODE
                actionPromise = createQuickSale({
                    barbershop_id: shopId,
                    client_name: clientName,
                    items: cart,
                    total_price: total
                })
            }

            // Race against timeout
            const res: any = await Promise.race([actionPromise, timeoutPromise])

            // 4. Handle Response
            console.log("[QuickSale] ✅ Response:", res)

            if (res?.error) {
                console.error("[QuickSale] ❌ Error from Server:", res.error)
                toast.error(`Falha: ${res.error}`, {
                    id: toastId,
                    description: "Tente novamente ou contate o suporte.",
                    duration: 5000
                })
                return
            }

            // Success
            toast.success("Venda registrada com sucesso!", { id: toastId })

            // Clean up
            setClientName("")
            setCart([])
            onOpenChange(false)

        } catch (error: any) {
            console.error("[QuickSale] 💥 Catastrophic Error:", error)
            toast.error("Erro inesperado", {
                id: toastId,
                description: error.message || "Erro desconhecido ao processar venda."
            })
        } finally {
            setIsSaving(false)
        }
    }

    // Helper for currency
    const fmt = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {existingAppointmentId ? <Plus className="text-[#d4af37]" /> : <ShoppingCart className="text-[#d4af37]" />}
                        {existingAppointmentId ? "Adicionar ao Agendamento" : "Novo Lançamento (Checkout Rápido)"}
                    </DialogTitle>
                    <DialogDescription>
                        {existingAppointmentId ? "Adicione produtos ou serviços extras a este atendimento." : "Registre vendas de serviços ou produtos instantaneamente."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* 1. Client Input (Hidden if Existing) */}
                    {!existingAppointmentId && (
                        <div className="space-y-2">
                            <Label>Cliente</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                <Input
                                    placeholder="Nome do cliente (Enter para avulso)"
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                    className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-[#d4af37]"
                                />
                            </div>
                        </div>
                    )}

                    {/* 2. Add Items */}
                    <div className="space-y-2">
                        <Label>Adicionar Itens</Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-full justify-between bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
                                >
                                    {isLoadingData ? "Carregando catálogo..." : "Buscar serviço ou produto..."}
                                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-2 bg-zinc-900 border-zinc-800 text-white">
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Buscar..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="bg-zinc-950 border-zinc-800 focus-visible:ring-[#d4af37]"
                                        autoFocus
                                    />
                                    <div className="max-h-[200px] overflow-y-auto space-y-1">
                                        {filteredCatalog.length === 0 ? (
                                            <div className="p-2 text-sm text-zinc-500 text-center">Nenhum item encontrado.</div>
                                        ) : (
                                            filteredCatalog.map((item) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => addToCart(item)}
                                                    className="flex justify-between items-center p-2 hover:bg-zinc-800 rounded cursor-pointer text-sm"
                                                >
                                                    <span>{item.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="bg-zinc-800 text-xs hover:bg-zinc-700">
                                                            {item.type === 'product' ? 'Produto' : 'Serviço'}
                                                        </Badge>
                                                        <span className="font-bold text-[#d4af37]">{fmt(item.price)}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* 3. Cart Summary (keep exisiting...)

                    {/* 3. Cart Summary */}
                    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 min-h-[150px]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-zinc-400">Resumo do Pedido</span>
                            {cart.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCart([])}
                                    className="h-auto p-0 text-red-500 hover:text-red-400 text-xs"
                                >
                                    Limpar
                                </Button>
                            )}
                        </div>

                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-24 text-zinc-600 text-sm">
                                <ShoppingBagIcon />
                                <p>Nenhum item adicionado</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between bg-zinc-950 p-2 rounded border border-zinc-900">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{item.name}</span>
                                            <span className="text-xs text-zinc-500">{fmt(item.price)} un.</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center border border-zinc-800 rounded bg-zinc-900">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                                                >
                                                    -
                                                </button>
                                                <span className="w-6 text-center text-xs">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-zinc-500 hover:text-red-500 transition p-1"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 4. Total and Actions */}
                    <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-lg border border-[#d4af37]/20">
                        <div className="flex flex-col">
                            <span className="text-zinc-400 text-sm">Valor Total</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-[#d4af37]">
                                    {fmt(currentTotal + total)}
                                </span>
                                {currentTotal > 0 && cart.length > 0 && (
                                    <span className="text-xs text-zinc-500">
                                        ({fmt(currentTotal)} atual + {fmt(total)} novos)
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button
                            onClick={handleConfirm}
                            disabled={isSaving || cart.length === 0}
                            className="bg-[#d4af37] text-black hover:bg-[#b5952f] font-bold px-6"
                        >
                            {isSaving ? <Loader2 className="animate-spin mr-2" /> : <CheckIcon className="mr-2 h-4 w-4" />}
                            Confirmar Venda
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function ShoppingBagIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mb-2 opacity-20">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}
