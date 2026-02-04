
"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, Clock, Loader2, Check } from "lucide-react"
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
import { ptBR } from "date-fns/locale"
import { format } from "date-fns"
import { getAvailableSlots, updateAppointment } from "@/app/(main)/dashboard/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface EditAppointmentDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    appointment: any
    barbershopSlug: string
}

export function EditAppointmentDialog({
    isOpen,
    onOpenChange,
    appointment,
    barbershopSlug,
}: EditAppointmentDialogProps) {
    const [date, setDate] = useState<Date | undefined>(
        appointment ? new Date(appointment.date + "T00:00:00") : undefined
    )
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [isLoadingSlots, setIsLoadingSlots] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Reset state when opening
    useEffect(() => {
        if (isOpen && appointment) {
            const initialDate = new Date(appointment.date + "T00:00:00")
            setDate(initialDate)
            setSelectedTime(null) // User must pick a new time explicitly? Or pre-select current?
            // Let's pre-load slots for current day
            fetchSlots(initialDate)
        }
    }, [isOpen, appointment])

    const fetchSlots = async (selectedDate: Date | undefined) => {
        if (!selectedDate || !barbershopSlug) return

        setIsLoadingSlots(true)
        setAvailableSlots([])
        setSelectedTime(null)

        try {
            const dateStr = format(selectedDate, "yyyy-MM-dd")
            // Fetch slots for this date
            // We pass generic config (no specific professional unless appointment has one?)
            // Let's use appointment.professional_id if exists
            const { slots, error } = await getAvailableSlots(
                barbershopSlug,
                dateStr,
                appointment.professional_id
            )

            if (error) {
                toast.error("Erro ao buscar horários")
            } else {
                setAvailableSlots(slots || [])
            }
        } catch (error) {
            console.error(error)
            toast.error("Erro ao comunicar com servidor")
        } finally {
            setIsLoadingSlots(false)
        }
    }

    const handleDateSelect = (newDate: Date | undefined) => {
        setDate(newDate)
        if (newDate) {
            fetchSlots(newDate)
        }
    }

    const handleSave = async () => {
        if (!date || !selectedTime) return

        setIsSaving(true)
        try {
            const dateStr = format(date, "yyyy-MM-dd")
            const result = await updateAppointment({
                appointmentId: appointment.id,
                newDate: dateStr,
                newTime: selectedTime,
                professionalId: appointment.professional_id,
                slug: barbershopSlug,
            })

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success("Agendamento atualizado!")
            onOpenChange(false)
        } catch (error) {
            toast.error("Erro ao atualizar agendamento")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Editar Agendamento</DialogTitle>
                    <DialogDescription>
                        Escolha uma nova data e horário para o agendamento de <strong>{appointment?.client_name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Calendar Column */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Data</label>
                        <div className="border border-zinc-800 rounded-md p-1">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateSelect}
                                locale={ptBR}
                                className="bg-transparent"
                                classNames={{
                                    day_selected: "bg-[#d4af37] text-black hover:bg-[#d4af37] hover:text-black focus:bg-[#d4af37] focus:text-black",
                                    day_today: "bg-zinc-800 text-white"
                                }}
                            />
                        </div>
                    </div>

                    {/* Time Slots Column */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Horários Disponíveis</label>
                            <div className="text-xs text-zinc-500">
                                {date ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR }) : "Selecione uma data"}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 h-[280px] overflow-y-auto pr-2 content-start">
                            {isLoadingSlots ? (
                                <div className="col-span-3 flex items-center justify-center h-20 text-zinc-500">
                                    <Loader2 className="animate-spin mr-2" /> Carregando...
                                </div>
                            ) : availableSlots.length > 0 ? (
                                availableSlots.map((time) => (
                                    <Button
                                        key={time}
                                        variant="outline"
                                        className={cn(
                                            "border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all",
                                            selectedTime === time && "bg-[#d4af37] text-black border-[#d4af37] hover:bg-[#d4af37] hover:text-black"
                                        )}
                                        onClick={() => setSelectedTime(time)}
                                    >
                                        {time}
                                    </Button>
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-8 text-zinc-500 text-sm">
                                    Nenhum horário disponível para esta data.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="border-0 hover:bg-zinc-800 text-zinc-400">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!selectedTime || isSaving}
                        className="bg-[#d4af37] text-black hover:bg-[#b5952f]"
                    >
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Alteração
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
