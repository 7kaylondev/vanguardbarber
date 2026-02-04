
"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, Clock, Loader2, Check, User, Phone, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ptBR } from "date-fns/locale"
import { format } from "date-fns"
import { getAvailableSlots, createAppointment, getShopServices } from "@/app/(main)/dashboard/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface NewAppointmentDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    slug: string
    shopId: string // Needed for creation
    initialClientName?: string
    initialClientPhone?: string
}

interface Service {
    id: string
    name: string
    price: number
    duration?: number
}

export function NewAppointmentDialog({
    isOpen,
    onOpenChange,
    slug,
    shopId,
    initialClientName = "",
    initialClientPhone = ""
}: NewAppointmentDialogProps) {
    const [step, setStep] = useState(1) // 1: Client/Service, 2: Date/Time

    // Form Data
    const [clientName, setClientName] = useState(initialClientName)
    const [clientPhone, setClientPhone] = useState(initialClientPhone)
    const [selectedServiceId, setSelectedServiceId] = useState<string>("")
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [isImmediate, setIsImmediate] = useState(false) // New State

    // Data Source
    const [services, setServices] = useState<Service[]>([])
    const [availableSlots, setAvailableSlots] = useState<string[]>([])

    // Loading States
    const [isLoadingServices, setIsLoadingServices] = useState(false)
    const [isLoadingSlots, setIsLoadingSlots] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Fetch Services on Open
    useEffect(() => {
        if (isOpen) {
            setClientName(initialClientName)
            setClientPhone(initialClientPhone)

            if (slug) {
                setIsLoadingServices(true)
                getShopServices(slug)
                    .then(data => setServices(data as Service[]))
                    .catch(() => toast.error("Erro ao carregar serviços"))
                    .finally(() => setIsLoadingServices(false))
            }
        }
    }, [isOpen, slug, initialClientName, initialClientPhone])

    // Fetch Slots when Date changes
    useEffect(() => {
        if (step === 2 && selectedDate && !isImmediate) {
            fetchSlots(selectedDate)
        }
    }, [step, selectedDate, isImmediate])

    const fetchSlots = async (date: Date) => {
        setIsLoadingSlots(true)
        setAvailableSlots([])
        setSelectedTime(null)

        try {
            const dateStr = format(date, "yyyy-MM-dd")
            const { slots, error } = await getAvailableSlots(slug, dateStr)
            if (error) {
                toast.error("Erro ao buscar horários")
            } else {
                setAvailableSlots(slots || [])
            }
        } catch {
            toast.error("Erro ao conectar")
        } finally {
            setIsLoadingSlots(false)
        }
    }

    const handleSave = async () => {
        if (!selectedDate || !selectedTime || !selectedServiceId || !clientName) return

        setIsSaving(true)
        try {
            const dateStr = format(selectedDate, "yyyy-MM-dd")
            const res = await createAppointment({
                barbershop_id: shopId,
                service_id: selectedServiceId,
                client_name: clientName,
                client_phone: clientPhone,
                date: dateStr,
                time: selectedTime,
            })

            if (res.error) {
                toast.error(res.error)
                return
            }

            toast.success("Agendamento criado com sucesso!")
            onOpenChange(false)
            // Reset form
            setClientName("")
            setClientPhone("")
            setSelectedServiceId("")
            setSelectedTime(null)
            setStep(1)
        } catch (err) {
            console.error(err)
            toast.error("Erro inesperado ao criar agendamento")
        } finally {
            setIsSaving(false)
        }
    }

    const handleNext = () => {
        if (step === 1) {
            if (!clientName || !selectedServiceId) {
                toast.warning("Preencha o nome e escolha um serviço")
                return
            }
            setStep(2)
        } else {
            handleSave()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                    <DialogDescription>
                        {step === 1 ? "Informe os dados do cliente e serviço." : "Escolha a data e o horário."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome do Cliente <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                    <Input
                                        placeholder="Ex: João Silva"
                                        className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-[#d4af37]"
                                        value={clientName}
                                        onChange={e => setClientName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>WhatsApp (Opcional)</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                    <Input
                                        placeholder="(11) 99999-9999"
                                        className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-[#d4af37]"
                                        value={clientPhone}
                                        onChange={e => setClientPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Serviço <span className="text-red-500">*</span></Label>
                                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-[#d4af37]">
                                        <SelectValue placeholder={isLoadingServices ? "Carregando..." : "Selecione um serviço"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                        {services.map(s => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.name} - R$ {s.price.toFixed(2)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {!isImmediate ? (
                                <>
                                    {/* Calendar */}
                                    <div className="border border-zinc-800 rounded-md p-2 flex justify-center">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            locale={ptBR}
                                            className="bg-transparent"
                                            classNames={{
                                                day_selected: "bg-[#d4af37] text-black hover:bg-[#d4af37] hover:text-black focus:bg-[#d4af37] focus:text-black",
                                                day_today: "bg-zinc-800 text-white"
                                            }}
                                        />
                                    </div>

                                    {/* Slots */}
                                    <div className="h-[280px] overflow-y-auto pr-1">
                                        <Label className="mb-2 block text-xs uppercase tracking-wider text-zinc-500">Horários Livres</Label>
                                        {isLoadingSlots ? (
                                            <div className="flex justify-center items-center h-20 text-zinc-500">
                                                <Loader2 className="animate-spin mr-2 h-4 w-4" /> Buscando...
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                {availableSlots.length > 0 ? availableSlots.map(time => (
                                                    <Button
                                                        key={time}
                                                        variant="outline"
                                                        size="sm"
                                                        className={cn(
                                                            "border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all",
                                                            selectedTime === time && "bg-[#d4af37] text-black border-[#d4af37] hover:bg-[#d4af37] hover:text-black"
                                                        )}
                                                        onClick={() => setSelectedTime(time)}
                                                    >
                                                        {time}
                                                    </Button>
                                                )) : (
                                                    <p className="col-span-2 text-xs text-zinc-500 text-center py-4">Nenhum horário disponível.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="col-span-2 flex flex-col items-center justify-center h-[280px] bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 text-center space-y-4">
                                    <div className="bg-[#d4af37]/20 p-4 rounded-full text-[#d4af37]">
                                        <Clock size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">Atendimento Imediato</h3>
                                        <p className="text-zinc-400 text-sm">O cliente será encaixado agora ({format(new Date(), 'HH:mm')}).</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    {step === 2 && (
                        <div className="mr-auto flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="immediate"
                                checked={isImmediate}
                                onChange={(e) => {
                                    setIsImmediate(e.target.checked)
                                    if (e.target.checked) {
                                        setSelectedTime(format(new Date(), 'HH:mm'))
                                        setSelectedDate(new Date())
                                    } else {
                                        setSelectedTime(null)
                                    }
                                }}
                                className="w-4 h-4 rounded border-gray-300 text-[#d4af37] focus:ring-[#d4af37] accent-[#d4af37]"
                            />
                            <Label htmlFor="immediate" className="cursor-pointer text-white font-bold select-none">
                                Imediato (Agora)
                            </Label>
                        </div>
                    )}

                    {step === 2 && (
                        <Button variant="ghost" onClick={() => setStep(1)} className="text-zinc-400 hover:text-white">
                            Voltar
                        </Button>
                    )}

                    <Button
                        onClick={handleNext}
                        disabled={isLoadingServices || (step === 2 && (!selectedTime || isSaving))}
                        className="bg-[#d4af37] text-black hover:bg-[#b5952f] w-full sm:w-auto"
                    >
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {step === 1 ? "Continuar" : "Confirmar Agendamento"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
