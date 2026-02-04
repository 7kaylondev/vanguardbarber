
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ShoppingBag, ChevronLeft, ChevronRight, Clock, MapPin, Truck, Store, User, Loader2, Crown, Check } from "lucide-react"
import { getAvailableSlots, createAppointment, createOrder } from "@/app/(main)/dashboard/actions"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { motion, AnimatePresence } from "framer-motion"
import { useShowcaseAuth } from "@/components/showcase/auth/showcase-auth-provider"
import { SuccessDialog } from "@/components/showcase/booking/success-dialog"
import { FloatingWhatsApp } from "@/components/showcase/floating-whatsapp"
import { useEffect } from "react"

interface ShowcaseClientProps {
    shop: any
    services: any[]
    products: any[]
    clubPlans: any[]
    professionals: any[]
}

export function ShowcaseClient({ shop, services, products, clubPlans, professionals }: ShowcaseClientProps) {
    const [cart, setCart] = useState<any[]>([])
    const [bookingItem, setBookingItem] = useState<any | null>(null)
    const [bookingDate, setBookingDate] = useState<Date | undefined>(new Date())
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [selectedPro, setSelectedPro] = useState<any | null>(null)
    const [checkoutOpen, setCheckoutOpen] = useState(false)
    const [deliveryType, setDeliveryType] = useState('pickup')
    const [address, setAddress] = useState('')

    // Steps: 'select-pro', 'select-date'
    const [bookingStep, setBookingStep] = useState<'select-pro' | 'select-date'>('select-date')

    // Customer Data
    const { user, profile } = useShowcaseAuth()

    // Initialize with profile data or user metadata
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [isEditingData, setIsEditingData] = useState(false)

    useEffect(() => {
        if (profile) {
            setCustomerName(profile.name || user?.user_metadata?.name || '')
            setCustomerPhone(profile.phone || user?.user_metadata?.phone || '')
        } else if (user) {
            setCustomerName(user.user_metadata?.name || '')
            setCustomerPhone(user.user_metadata?.phone || '')
        }
    }, [profile, user])

    const [loading, setLoading] = useState(false)

    // Helper: Phone Mask
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '')
        if (val.length > 11) val = val.substring(0, 11)
        val = val.replace(/^(\d{2})(\d)/g, '($1) $2')
        val = val.replace(/(\d{5})(\d)/, '$1-$2')
        setCustomerPhone(val)
    }

    // --- BOOKING LOGIC ---
    const handleBookClick = async (service: any) => {
        setBookingItem(service)
        setBookingDate(new Date())
        setSelectedSlot(null)
        setSelectedPro(null)

        // If we have professionals, start there. Else go straight to date.
        if (professionals && professionals.length > 0) {
            setBookingStep('select-pro')
        } else {
            setBookingStep('select-date')
            fetchSlots(new Date(), null)
        }

        setCheckoutOpen(true)
    }

    const fetchSlots = async (date: Date, proId?: string | null) => {
        setAvailableSlots([])
        setSelectedSlot(null)
        const dateStr = format(date, 'yyyy-MM-dd')
        const res = await getAvailableSlots(shop.slug, dateStr, proId || undefined)
        if (res?.slots) {
            setAvailableSlots(res.slots)
        }
    }

    const handleProSelect = (pro: any | null) => {
        setSelectedPro(pro)
        setBookingStep('select-date')
        fetchSlots(bookingDate || new Date(), pro?.id)
    }

    const handleDateSelect = (date: Date | undefined) => {
        setBookingDate(date)
        if (date) fetchSlots(date, selectedPro?.id)
    }

    // --- CART LOGIC (Products) ---
    const addToCart = (product: any) => {
        setCart(prev => [...prev, product])
        toast.success("Adicionado ao carrinho!")
    }

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index))
    }

    // --- FINISH & WHATSAPP ---
    const handleFinish = async () => {
        // Use state values directly (they are pre-filled by useEffect)
        if (!customerName || !customerPhone || customerPhone.length < 10) {
            toast.error("Por favor, preencha seu nome e telefone (com DDD).")
            // If logged in but missing data, open edit mode
            if (user && !isEditingData) setIsEditingData(true)
            return
        }

        setLoading(true)
        const phone = (shop.whatsapp_orders || shop.whatsapp).replace(/\D/g, '')
        let message = ''

        if (bookingItem) {
            // --- BOOKING FLOW ---
            if (!selectedSlot || !bookingDate) {
                toast.error("Selecione data e horário!")
                setLoading(false)
                return
            }

            // 1. Save to DB
            const res = await createAppointment({
                barbershop_id: shop.id,
                service_id: bookingItem.id,
                client_name: customerName,
                client_phone: customerPhone,
                date: format(bookingDate, 'yyyy-MM-dd'),
                time: selectedSlot,
                professional_id: selectedPro?.id
            })

            if (res?.error) {
                toast.error("Erro ao agendar. Tente novamente.")
                setLoading(false)
                return
            }

            // 2. Build Message (WhatsApp Fallback or Dual Mode)
            message = `*OLÁ! NOVO AGENDAMENTO* 📅\n\n`
            message += `💈 *Barbearia:* ${shop.name}\n`
            message += `👤 *Cliente:* ${customerName}\n`
            message += `✂️ *Serviço:* ${bookingItem.name}\n`
            if (selectedPro) {
                message += `💇‍♂️ *Profissional:* ${selectedPro.name}\n`
            }
            message += `💰 *Valor:* R$ ${bookingItem.price}\n`
            message += `📆 *Data:* ${format(bookingDate, 'dd/MM/yyyy')}\n`
            message += `⏰ *Horário:* ${selectedSlot}\n`

            // CRM FLOW CHECK
            if (shop.booking_method === 'crm') {
                // SUCCESS! Show Dialog
                setLoading(false)
                setCheckoutOpen(false)
                setShowSuccess(true)

                // Clear state in background
                setBookingItem(null)
                setCustomerName('')
                setCustomerPhone('')
                setSelectedSlot(null)
                return
            }

        } else {
            // --- PRODUCT FLOW ---
            if (cart.length === 0) {
                setLoading(false)
                return
            }

            const total = cart.reduce((acc, item) => acc + item.price, 0)

            // 1. Save to DB
            const res = await createOrder({
                barbershop_id: shop.id,
                items: cart.map(c => ({ id: c.id, name: c.name, price: c.price })),
                total,
                delivery_type: deliveryType,
                address: deliveryType === 'delivery' ? address : undefined,
                client_name: customerName,
                client_phone: customerPhone
            })

            if (res?.error) {
                toast.error("Erro ao processar pedido.")
                setLoading(false)
                return
            }

            // 2. Build Message
            message = `*OLÁ! NOVO PEDIDO* 🛍️\n\n`
            message += `💈 *Loja:* ${shop.name}\n`
            message += `👤 *Cliente:* ${customerName}\n`
            cart.forEach(item => {
                message += `▪️ ${item.name} - R$ ${item.price}\n`
            })
            message += `\n💰 *Total:* R$ ${total.toFixed(2)}\n`
            message += `📦 *Método:* ${deliveryType === 'delivery' ? 'Entrega 🛵' : 'Retirada 🏪'}\n`
            if (deliveryType === 'delivery') {
                message += `📍 *Endereço:* ${address}\n`
            }
        }

        // 3. Redirect (WhatsApp)
        const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')

        setCheckoutOpen(false)
        setCart([])
        setBookingItem(null)
        setLoading(false)
        setCustomerName('')
        setCustomerPhone('')
        setAddress('')
    }

    const primaryColor = shop.primary_color || '#d4af37'

    const [showSuccess, setShowSuccess] = useState(false)

    return (
        <div className="pb-24">

            <SuccessDialog
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                shopName={shop.name}
            />

            <FloatingWhatsApp
                whatsapp={shop.whatsapp || shop.whatsapp_orders}
                shopName={shop.name}
                hasCart={cart.length > 0}
            />

            {/* SERVICES LIST */}
            {(shop.modulo_agendamento_ativo !== false && services.length > 0) && (
                <section className="mb-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-l-4 pl-3 text-white" style={{ borderColor: primaryColor }}>
                        Serviços
                    </h2>
                    <div className="grid gap-3">
                        {services.map(service => (
                            <div key={service.id} onClick={() => handleBookClick(service)}
                                className="bg-[#0f0f0f] border border-zinc-900 p-3 rounded-lg flex items-center gap-4 active:scale-[0.98] transition-all hover:border-zinc-700 hover:bg-zinc-900/20 cursor-pointer relative overflow-hidden">
                                {service.highlight && (
                                    <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-bl-lg z-10">
                                        POPULAR
                                    </div>
                                )}
                                <div className="h-14 w-14 bg-zinc-800 rounded-md overflow-hidden shrink-0">
                                    {service.image_url ? <img src={service.image_url} className="w-full h-full object-cover" /> : <Clock className="m-auto text-zinc-600" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white text-sm">{service.name}</h3>
                                    <p className="text-xs text-gray-500">{service.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-sm" style={{ color: primaryColor }}>R$ {service.price}</div>
                                    <div className="text-[10px] bg-zinc-800 px-2 rounded mt-1">Agendar</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* CLUB PLANS LIST */}
            {(clubPlans && clubPlans.length > 0) && (
                <section className="mb-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-l-4 pl-3 text-[#d4af37]" style={{ borderColor: '#d4af37' }}>
                        💎 Clube de Assinaturas
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {clubPlans.map(plan => (
                            <div key={plan.id} className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#d4af37]/30 p-4 rounded-xl relative overflow-hidden group hover:border-[#d4af37] transition-all">
                                <div className="absolute top-0 right-0 bg-[#d4af37] text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                                    PREMIUM
                                </div>

                                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                                    <Crown size={18} className="text-[#d4af37]" /> {plan.name}
                                </h3>

                                <div className="space-y-2 mt-4 mb-4">
                                    {(plan.description || "").split('\n').map((benefit: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                            <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                                            <span className="leading-tight">{benefit}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center border-t border-zinc-800 pt-4 mt-auto">
                                    <div>
                                        <span className="text-xs text-zinc-500 block">Mensalidade</span>
                                        <span className="text-xl font-bold text-[#d4af37]">R$ {plan.price}</span>
                                    </div>
                                    <Button
                                        onClick={() => window.open(`https://wa.me/55${shop.whatsapp.replace(/\D/g, '')}?text=Olá, quero assinar o plano *${plan.name}*!`, '_blank')}
                                        className="bg-[#d4af37] text-black hover:bg-[#b5952f] font-bold h-10 px-6 rounded-full shadow-lg hover:shadow-[#d4af37]/20 transition-all"
                                    >
                                        Assinar Agora
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* PRODUCTS LIST */}
            {(shop.modulo_produtos_ativo !== false && products.length > 0) && (
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-l-4 pl-3 text-white" style={{ borderColor: primaryColor }}>
                        Produtos
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {products.map(prod => (
                            <div key={prod.id} className="bg-[#0f0f0f] border border-zinc-900 rounded-xl overflow-hidden group relative">
                                {prod.highlight && <div className="absolute top-2 left-2 bg-yellow-500 text-black text-[9px] font-bold px-2 rounded-full z-10">DESTAQUE</div>}
                                <div className="aspect-square bg-zinc-800 relative">
                                    {prod.image_url ? <img src={prod.image_url} className="w-full h-full object-cover" /> : <ShoppingBag className="m-auto text-zinc-600" />}
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold text-sm text-white truncate">{prod.name}</h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-bold text-sm" style={{ color: primaryColor }}>R$ {prod.price}</span>
                                        <Button size="icon" className="h-6 w-6 rounded-full" style={{ backgroundColor: primaryColor }} onClick={() => addToCart(prod)}>
                                            <ShoppingBag size={12} className="text-black" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* FLOATING CART BUTTON */}
            {cart.length > 0 && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Button onClick={() => { setBookingItem(null); setCheckoutOpen(true); }} className="h-14 w-14 rounded-full shadow-2xl flex items-center justify-center relative" style={{ backgroundColor: primaryColor }}>
                        <ShoppingBag className="text-black" />
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center font-bold border-2 border-black">
                            {cart.length}
                        </span>
                    </Button>
                </div>
            )}

            {/* CHECKOUT MODAL */}
            <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                <DialogContent className="bg-[#111] border-zinc-800 text-white w-[95%] max-w-md rounded-xl max-h-[90vh] overflow-y-auto">
                    <DialogTitle className="sr-only">Checkout</DialogTitle>
                    <DialogDescription className="sr-only">
                        Preencha seus dados para confirmar o agendamento ou pedido.
                    </DialogDescription>
                    {bookingItem ? (
                        // AGENDAMENTO
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Clock className="text-yellow-500" /> Agendar Horário
                            </h2>
                            <div className="bg-zinc-900 p-3 rounded-lg flex justify-between items-center">
                                <span>{bookingItem.name}</span>
                                <span className="font-bold text-yellow-500">R$ {bookingItem.price}</span>
                            </div>

                            {/* STEP 1: SELECT PRO */}
                            {bookingStep === 'select-pro' && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <Label className="text-xs font-bold text-gray-500 uppercase">Escolha o Profissional</Label>
                                    <div className="grid gap-2">
                                        <div
                                            onClick={() => handleProSelect(null)}
                                            className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700 bg-zinc-900 hover:border-yellow-500 hover:bg-zinc-800 transition-all text-left cursor-pointer"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center">
                                                <Store size={18} className="text-zinc-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-sm">Qualquer Profissional</h3>
                                                <p className="text-xs text-green-500">Maior disponibilidade</p>
                                            </div>
                                        </div>

                                        {professionals.map(pro => (
                                            <div
                                                key={pro.id}
                                                onClick={() => handleProSelect(pro)}
                                                className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700 bg-zinc-900 hover:border-yellow-500 hover:bg-zinc-800 transition-all text-left cursor-pointer"
                                            >
                                                <div className="h-10 w-10 rounded-full bg-zinc-800 overflow-hidden">
                                                    {pro.photo_url ? <img src={pro.photo_url} className="w-full h-full object-cover" /> : <User className="m-auto mt-2 text-zinc-600" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white text-sm">{pro.name}</h3>
                                                    <p className="text-xs text-yellow-600">{pro.specialty}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: SELECT DATE/TIME */}
                            {bookingStep === 'select-date' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between">
                                        {(professionals && professionals.length > 0) && (
                                            <Button variant="ghost" size="sm" onClick={() => setBookingStep('select-pro')} className="text-xs text-zinc-400 -ml-2">
                                                <ChevronLeft size={14} className="mr-1" /> Trocar Profissional
                                            </Button>
                                        )}
                                        {selectedPro && (
                                            <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-yellow-500 border border-zinc-700">
                                                Com: {selectedPro.name}
                                            </span>
                                        )}
                                    </div>

                                    <div className="bg-black border border-zinc-800 rounded-lg p-2 flex justify-center mx-auto w-fit">
                                        <Calendar
                                            mode="single"
                                            selected={bookingDate}
                                            onSelect={handleDateSelect}
                                            locale={ptBR}
                                            className="rounded-md"
                                            classNames={{
                                                caption: "flex justify-center pt-1 relative items-center",
                                                caption_label: "text-sm font-medium",
                                            }}
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                        />
                                    </div>

                                    {/* SLOTS GRID */}
                                    <div className="grid grid-cols-4 gap-2">
                                        {availableSlots.map(slot => (
                                            <button
                                                key={slot}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`text-sm py-2 rounded border transition-all ${selectedSlot === slot ? 'bg-yellow-600 text-black border-yellow-600 font-bold' : 'border-zinc-700 text-gray-300 hover:border-yellow-500'}`}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                        {availableSlots.length === 0 && <p className="col-span-4 text-center text-gray-500 text-xs py-2">Nenhum horário disponível.</p>}
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-zinc-800">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs font-bold text-gray-500">SEUS DADOS</Label>
                                            {(user && !isEditingData) && (
                                                <Button variant="link" size="sm" onClick={() => setIsEditingData(true)} className="text-xs text-[#d4af37] h-auto p-0">
                                                    Alterar
                                                </Button>
                                            )}
                                        </div>

                                        {user && !isEditingData ? (
                                            <div className="bg-zinc-900 border border-zinc-800 rounded p-3 text-sm text-zinc-300">
                                                <p className="font-bold text-white flex items-center gap-2">
                                                    <User size={14} className="text-[#d4af37]" />
                                                    {customerName || user.email}
                                                </p>
                                                <p className="text-zinc-500 text-xs mt-1">{customerPhone || "Sem telefone"}</p>
                                                {!customerPhone && <p className="text-red-500 text-xs mt-1 font-bold">Telefone necessário!</p>}
                                                <p className="text-[10px] text-green-500 mt-2 font-bold uppercase tracking-wider">Logado como Cliente</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                <Input
                                                    placeholder="Seu Nome"
                                                    value={customerName}
                                                    onChange={e => setCustomerName(e.target.value)}
                                                    className="bg-black border-zinc-700"
                                                />
                                                <Input
                                                    placeholder="(99) 99999-9999"
                                                    value={customerPhone}
                                                    onChange={handlePhoneChange}
                                                    maxLength={15}
                                                    className="bg-black border-zinc-700"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <Button onClick={handleFinish} disabled={!selectedSlot || loading} className={`w-full font-bold h-12 text-white ${shop.booking_method === 'crm' ? 'bg-yellow-600 hover:bg-yellow-500 text-black' : 'bg-[#25D366] hover:bg-[#1caa53]'}`}>
                                        {loading && <Loader2 className="mr-2 animate-spin" />}
                                        {shop.booking_method === 'crm' ? "Finalizar Agendamento" : "Confirmar Agendamento (WhatsApp)"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // CARRINHO PRODUTOS
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <ShoppingBag className="text-yellow-500" /> Carrinho
                            </h2>

                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {cart.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center bg-zinc-900 p-2 rounded">
                                        <span className="text-sm">{item.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold">R$ {item.price}</span>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => removeFromCart(i)}>x</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-zinc-800 pt-4">
                                <RadioGroup value={deliveryType} onValueChange={setDeliveryType} className="grid grid-cols-2 gap-4">
                                    <div className={`border rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer transition-colors ${deliveryType === 'pickup' ? 'border-yellow-500 bg-yellow-900/10' : 'border-zinc-800'}`}>
                                        <Store className={deliveryType === 'pickup' ? 'text-yellow-500' : 'text-zinc-500'} />
                                        <span className="text-xs font-bold">Retirada</span>
                                        <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                                    </div>
                                    <div className={`border rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer transition-colors ${deliveryType === 'delivery' ? 'border-yellow-500 bg-yellow-900/10' : 'border-zinc-800'}`}>
                                        <Truck className={deliveryType === 'delivery' ? 'text-yellow-500' : 'text-zinc-500'} />
                                        <span className="text-xs font-bold">Entrega</span>
                                        <RadioGroupItem value="delivery" id="delivery" className="sr-only" />
                                    </div>
                                </RadioGroup>
                            </div>

                            <AnimatePresence>
                                {deliveryType === 'delivery' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-2 overflow-hidden"
                                    >
                                        <Label>Endereço Completo</Label>
                                        <Input
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Rua, Número, Bairro, Cidade"
                                            className="bg-black border-zinc-700"
                                        />
                                        {!address.toLowerCase().includes('mallet') && address.length > 5 && (
                                            <p className="text-xs text-yellow-500">Nota: Frete calculado no atendimento.</p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-zinc-800">
                                <span>Total</span>
                                <span style={{ color: primaryColor }}>R$ {cart.reduce((a, b) => a + b.price, 0).toFixed(2)}</span>
                            </div>

                            {(deliveryType === 'delivery' && cart.reduce((a, b) => a + b.price, 0) < (shop.min_order_value || 0)) && (
                                <div className="p-2 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-xs text-center">
                                    Pedido mínimo para entrega: R$ {(shop.min_order_value || 0).toFixed(2)}
                                </div>
                            )}

                            <div className="space-y-3 pt-4 border-t border-zinc-800">
                                <Label className="text-xs font-bold text-gray-500">SEUS DADOS</Label>
                                {user ? (
                                    <div className="bg-zinc-900 border border-zinc-800 rounded p-3 text-sm text-zinc-300">
                                        <p className="font-bold text-white flex items-center gap-2">
                                            <User size={14} className="text-[#d4af37]" /> {profile?.name || user.email}
                                        </p>
                                        <p className="text-zinc-500 text-xs mt-1">{profile?.phone}</p>
                                        <p className="text-[10px] text-green-500 mt-2 font-bold uppercase tracking-wider">Logado como Cliente</p>
                                    </div>
                                ) : (
                                    <>
                                        <Input placeholder="Seu Nome" value={customerName} onChange={e => setCustomerName(e.target.value)} className="bg-black border-zinc-700" />
                                        <Input
                                            placeholder="(99) 99999-9999"
                                            value={customerPhone}
                                            onChange={handlePhoneChange}
                                            maxLength={15}
                                            className="bg-black border-zinc-700"
                                        />
                                    </>
                                )}
                            </div>

                            <Button
                                onClick={handleFinish}
                                disabled={
                                    cart.length === 0 ||
                                    (deliveryType === 'delivery' && !address) ||
                                    (deliveryType === 'delivery' && cart.reduce((a, b) => a + b.price, 0) < (shop.min_order_value || 0)) ||
                                    loading
                                }
                                className="w-full bg-[#25D366] hover:bg-[#1caa53] text-white font-bold h-12"
                            >
                                {loading && <Loader2 className="mr-2 animate-spin" />}
                                Finalizar Pedido (WhatsApp)
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
