'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { upsertOperatingHours } from "@/app/(main)/dashboard/actions"
import { Loader2, Save, Clock, Edit2, Check } from "lucide-react"

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

interface OperatingHoursFormProps {
    shopId: string
    initialData: any[]
}

export function OperatingHoursForm({ shopId, initialData }: OperatingHoursFormProps) {
    const [loading, setLoading] = useState(false)
    const [hours, setHours] = useState(() => {
        return DAYS.map((day, index) => {
            const existing = initialData.find(d => d.day_of_week === index)
            return existing || {
                day_of_week: index,
                is_closed: index === 0, // Closed on Sundays default
                start_time: '09:00',
                end_time: '19:00',
                lunch_start: '',
                lunch_end: '',
                slot_duration: 30
            }
        })
    })

    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null)

    const updateDay = (index: number, field: string, value: any) => {
        const newHours = [...hours]
        newHours[index] = { ...newHours[index], [field]: value }
        setHours(newHours)
    }

    // Apply to Mon-Fri (Index 1-5)
    const applyToWeek = () => {
        if (selectedDayIndex === null) return
        if (!confirm("Copiar este horário para todos os dias úteis (Seg-Sex)?")) return;

        const source = hours[selectedDayIndex]
        const newHours = hours.map((h, i) => {
            if (i >= 1 && i <= 5 && i !== selectedDayIndex) {
                return {
                    ...h,
                    start_time: source.start_time,
                    end_time: source.end_time,
                    lunch_start: source.lunch_start,
                    lunch_end: source.lunch_end,
                    is_closed: source.is_closed
                }
            }
            return h
        })
        setHours(newHours)
        toast.success("Horários replicados para dias úteis!")
        setSelectedDayIndex(null)
    }

    async function handleSubmit() {
        setLoading(true)
        const res = await upsertOperatingHours(shopId, hours)
        setLoading(false)

        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success("Grade de horários salva!")
        }
    }

    return (
        <div className="space-y-6">
            <Card className="bg-[#111] border-zinc-800">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2 text-yellow-500">
                                <Clock size={20} /> Horários de Funcionamento
                            </CardTitle>
                            <CardDescription>Defina a grade semanal da barbearia.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                            <span className="text-xs text-zinc-400">Tempo de Corte:</span>
                            <Input
                                type="number"
                                className="w-16 h-8 bg-black border-zinc-700 text-center"
                                value={hours[1].slot_duration || 30}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value)
                                    setHours(prev => prev.map(h => ({ ...h, slot_duration: val })))
                                }}
                            />
                            <span className="text-xs text-zinc-400">min</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {hours.map((day, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${day.is_closed ? 'bg-red-500' : 'bg-green-500'}`} />
                                    <span className="font-bold text-zinc-200 w-24">{DAYS[index]}</span>

                                    <div className="hidden md:flex flex-col text-xs text-zinc-500">
                                        {day.is_closed ? (
                                            <span>Fechado</span>
                                        ) : (
                                            <>
                                                <span className="text-zinc-300">{day.start_time} - {day.end_time}</span>
                                                {(day.lunch_start && day.lunch_end) && (
                                                    <span className="text-zinc-600">Almoço: {day.lunch_start}-{day.lunch_end}</span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <Button variant="outline" size="sm" onClick={() => setSelectedDayIndex(index)} className="border-zinc-700 hover:bg-zinc-800 text-xs">
                                    <Edit2 className="w-3 h-3 mr-2" /> Editar
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end sticky bottom-4 z-10">
                <Button onClick={handleSubmit} disabled={loading} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold shadow-lg w-full md:w-auto h-12 text-lg">
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Salvar Tudo
                </Button>
            </div>

            {/* EDIT DIALOG */}
            <Dialog open={selectedDayIndex !== null} onOpenChange={(open) => !open && setSelectedDayIndex(null)}>
                <DialogContent className="bg-[#111] border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Editar {selectedDayIndex !== null ? DAYS[selectedDayIndex] : ''}</DialogTitle>
                        <DialogDescription>Ajuste os horários para este dia.</DialogDescription>
                    </DialogHeader>

                    {selectedDayIndex !== null && (
                        <div className="space-y-6 py-4">
                            <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                                <Label>Dia Aberto?</Label>
                                <Switch
                                    checked={!hours[selectedDayIndex].is_closed}
                                    onCheckedChange={(c) => updateDay(selectedDayIndex, 'is_closed', !c)}
                                    className="data-[state=checked]:bg-green-600"
                                />
                            </div>

                            {!hours[selectedDayIndex].is_closed && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Abertura</Label>
                                            <Input
                                                type="time"
                                                value={hours[selectedDayIndex].start_time}
                                                onChange={(e) => updateDay(selectedDayIndex, 'start_time', e.target.value)}
                                                className="bg-black border-zinc-700"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Fechamento</Label>
                                            <Input
                                                type="time"
                                                value={hours[selectedDayIndex].end_time}
                                                onChange={(e) => updateDay(selectedDayIndex, 'end_time', e.target.value)}
                                                className="bg-black border-zinc-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 border-t border-zinc-800 pt-4">
                                        <Label className="text-zinc-400 text-xs uppercase tracking-wider">Intervalo de Almoço (Opcional)</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Início</Label>
                                                <Input
                                                    type="time"
                                                    value={hours[selectedDayIndex].lunch_start || ''}
                                                    onChange={(e) => updateDay(selectedDayIndex, 'lunch_start', e.target.value)}
                                                    className="bg-black border-zinc-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Fim</Label>
                                                <Input
                                                    type="time"
                                                    value={hours[selectedDayIndex].lunch_end || ''}
                                                    onChange={(e) => updateDay(selectedDayIndex, 'lunch_end', e.target.value)}
                                                    className="bg-black border-zinc-700"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:justify-between">
                        {selectedDayIndex !== null && !hours[selectedDayIndex].is_closed && (
                            <Button type="button" variant="outline" onClick={applyToWeek} className="border-blue-900 text-blue-400 hover:bg-blue-900/20">
                                Copiar p/ Seg-Sex
                            </Button>
                        )}
                        <Button onClick={() => setSelectedDayIndex(null)} className="bg-white text-black hover:bg-zinc-200">
                            Concluir Edição
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
