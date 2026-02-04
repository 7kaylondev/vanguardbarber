
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { saveFullShopConfiguration } from "@/app/(main)/dashboard/actions"
import { Loader2, Save, Clock, MapPin, Phone, Facebook, Instagram, AlertTriangle, Edit2 } from "lucide-react"

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

interface UnifiedConfigFormProps {
    shop: any
    initialHours: any[]
}

export function UnifiedConfigForm({ shop, initialHours }: UnifiedConfigFormProps) {
    const [loading, setLoading] = useState(false)

    // 1. Unified State
    const [formState, setFormState] = useState({
        endereco_completo: shop.address || '',
        whatsapp: shop.whatsapp || '',
        whatsapp_pedidos: shop.whatsapp_orders || '',
        facebook_link: shop.facebook_url || '',
        instagram_url: shop.instagram_url || '',
        valor_minimo_entrega: shop.min_order_value || 0,
        modo_emergencia: shop.status_manual || false,
        tipo_agendamento: shop.booking_method || 'whatsapp',

        // Modules
        modulo_agendamento_ativo: shop.modulo_agendamento_ativo !== false, // Default true
        modulo_produtos_ativo: shop.modulo_produtos_ativo !== false,
        modulo_clube_ativo: shop.modulo_clube_ativo || false, // Default false for Club
        modulo_sobre_nos_ativo: shop.modulo_sobre_nos_ativo !== false,
        inactivity_threshold_days: shop.inactivity_threshold_days || 45,

        grade_horarios: DAYS.map((day, index) => {
            const existing = initialHours.find(d => d.day_of_week === index)
            return existing ? { ...existing, day_of_week: index } : {
                day_of_week: index,
                is_closed: index === 0, // Closed Sunday default
                start_time: '09:00',
                end_time: '19:00',
                lunch_start: null,
                lunch_end: null,
                slot_duration: 30
            }
        })
    })

    const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null)

    // Handlers
    const updateField = (field: string, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }))
    }

    const updateHour = (index: number, field: string, value: any) => {
        const newHours = [...formState.grade_horarios]
        newHours[index] = { ...newHours[index], [field]: value }
        setFormState(prev => ({ ...prev, grade_horarios: newHours }))
    }

    const applyToWeek = () => {
        if (editingDayIndex === null) return
        if (!confirm("Copiar para Segunda a Sexta?")) return;

        const source = formState.grade_horarios[editingDayIndex]
        const newHours = formState.grade_horarios.map((h: any, i: number) => {
            if (i >= 1 && i <= 5 && i !== editingDayIndex) {
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
        setFormState(prev => ({ ...prev, grade_horarios: newHours }))
        toast.success("Replicado para dias úteis.")
    }

    const handleSaveAll = async () => {
        setLoading(true)
        console.log("Saving Payload:", formState) // Debug request

        const res = await saveFullShopConfiguration(formState)

        setLoading(false)
        if (res?.error) {
            console.error("Save Error:", res.error)
            toast.error("Erro ao salvar: " + res.error)
        } else {
            toast.success("Todas as alterações foram salvas com sucesso!")
        }
    }

    return (
        <div className="space-y-8 pb-32">

            {/* --- SEÇÃO 1: PREFERÊNCIAS GERAIS --- */}
            <Card className="bg-[#111] border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-yellow-500 flex items-center gap-2">
                        <AlertTriangle className="text-yellow-500" /> Preferências e Status
                    </CardTitle>
                    <CardDescription>Configurações de exibição e controle da loja.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Modo Emergência */}
                    <div className={`p-4 rounded-lg border flex items-center justify-between transition-colors ${formState.modo_emergencia ? 'bg-red-900/10 border-red-900' : 'bg-zinc-900/50 border-zinc-800'}`}>
                        <div className="space-y-1">
                            <Label className="text-base font-bold flex items-center gap-2">
                                🚨 Modo Emergência / Feriado
                            </Label>
                            <p className="text-sm text-gray-400">
                                Quando ativado, sua loja aparecerá como <strong>FECHADA</strong> na vitrine imediatamente, ignorando os horários.
                            </p>
                        </div>
                        <Switch
                            checked={formState.modo_emergencia}
                            onCheckedChange={(c) => updateField('modo_emergencia', c)}
                            className="data-[state=checked]:bg-red-600"
                        />
                    </div>

                    {/* Método de Agendamento */}
                    <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 space-y-3">
                        <Label className="text-base font-bold flex items-center gap-2">
                            📅 Método de Agendamento
                        </Label>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div
                                onClick={() => updateField('tipo_agendamento', 'whatsapp')}
                                className={`cursor-pointer border rounded-lg p-4 transition-all hover:bg-zinc-800 ${formState.tipo_agendamento === 'whatsapp' ? 'bg-[#25D366]/10 border-[#25D366] ring-1 ring-[#25D366]' : 'bg-black border-zinc-800'}`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formState.tipo_agendamento === 'whatsapp' ? 'border-[#25D366]' : 'border-zinc-500'}`}>
                                        {formState.tipo_agendamento === 'whatsapp' && <div className="w-2 h-2 rounded-full bg-[#25D366]" />}
                                    </div>
                                    <span className={`font-bold ${formState.tipo_agendamento === 'whatsapp' ? 'text-[#25D366]' : 'text-zinc-400'}`}>WhatsApp (Solicitação)</span>
                                </div>
                                <p className="text-xs text-zinc-500">
                                    O cliente escolhe o horário, mas é enviado para o seu WhatsApp para confirmar. Você lança manualmente.
                                </p>
                            </div>

                            <div
                                onClick={() => updateField('tipo_agendamento', 'crm')}
                                className={`cursor-pointer border rounded-lg p-4 transition-all hover:bg-zinc-800 ${formState.tipo_agendamento === 'crm' ? 'bg-[#d4af37]/10 border-[#d4af37] ring-1 ring-[#d4af37]' : 'bg-black border-zinc-800'}`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formState.tipo_agendamento === 'crm' ? 'border-[#d4af37]' : 'border-zinc-500'}`}>
                                        {formState.tipo_agendamento === 'crm' && <div className="w-2 h-2 rounded-full bg-[#d4af37]" />}
                                    </div>
                                    <span className={`font-bold ${formState.tipo_agendamento === 'crm' ? 'text-[#d4af37]' : 'text-zinc-400'}`}>Automático (CRM)</span>
                                </div>
                                <p className="text-xs text-zinc-500">
                                    O agendamento entra direto na sua agenda/CRM. O cliente recebe confirmação na tela.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Visibilidade dos Módulos (Vitrine) */}
                    <div className="space-y-4 pt-4 border-t border-zinc-800">
                        <Label className="text-base font-bold text-white mb-2 block">Vitrine: O que exibir?</Label>

                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Agendamento */}
                            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
                                <Label>📅 Agendamento</Label>
                                <Switch
                                    checked={formState.modulo_agendamento_ativo}
                                    onCheckedChange={(c) => updateField('modulo_agendamento_ativo', c)}
                                    className="data-[state=checked]:bg-green-600"
                                />
                            </div>

                            {/* Produtos */}
                            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
                                <Label>🛍️ Produtos</Label>
                                <Switch
                                    checked={formState.modulo_produtos_ativo}
                                    onCheckedChange={(c) => updateField('modulo_produtos_ativo', c)}
                                    className="data-[state=checked]:bg-green-600"
                                />
                            </div>

                            {/* Clube */}
                            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
                                <Label>💎 Clube (Assinaturas)</Label>
                                <Switch
                                    checked={formState.modulo_clube_ativo}
                                    onCheckedChange={(c) => updateField('modulo_clube_ativo', c)}
                                    className="data-[state=checked]:bg-[#d4af37]"
                                />
                            </div>

                            {/* Sobre Nós */}
                            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
                                <Label>👋 Sobre Nós</Label>
                                <Switch
                                    checked={formState.modulo_sobre_nos_ativo}
                                    onCheckedChange={(c) => updateField('modulo_sobre_nos_ativo', c)}
                                    className="data-[state=checked]:bg-green-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
                        {/* ... existing Address/MinOrder ... */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><MapPin size={16} /> Endereço Completo</Label>
                            <Input
                                placeholder="Rua X, 123 - Bairro, Cidade"
                                value={formState.endereco_completo}
                                onChange={e => updateField('endereco_completo', e.target.value)}
                                className="bg-black border-zinc-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">R$ Valor Mínimo de Entrega</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={formState.valor_minimo_entrega}
                                onChange={e => updateField('valor_minimo_entrega', parseFloat(e.target.value) || 0)}
                                className="bg-black border-zinc-700"
                            />
                            <p className="text-[10px] text-gray-500">Bloqueia pedidos de entrega abaixo deste valor.</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-blue-400"><Clock size={16} /> Dias para Inatividade (CRM)</Label>
                            <Input
                                type="number"
                                placeholder="45"
                                value={formState.inactivity_threshold_days}
                                onChange={e => updateField('inactivity_threshold_days', parseInt(e.target.value) || 45)}
                                className="bg-black border-zinc-700 border-blue-900/30 focus:border-blue-500"
                            />
                            <p className="text-[10px] text-gray-500">Cliente sem agendar por X dias vira "Inativo".</p>
                        </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-6">
                        <Label className="mb-4 block text-zinc-400 uppercase text-xs tracking-wider">Contatos & Redes Sociais</Label>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Phone size={16} /> WhatsApp Principal</Label>
                                <Input
                                    placeholder="Apenas números (Ex: 11999999999)"
                                    value={formState.whatsapp}
                                    onChange={e => updateField('whatsapp', e.target.value)}
                                    className="bg-black border-zinc-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-green-500"><Phone size={16} /> WhatsApp de Pedidos (Opcional)</Label>
                                <Input
                                    placeholder="Se vazio, usa o principal"
                                    value={formState.whatsapp_pedidos}
                                    onChange={e => updateField('whatsapp_pedidos', e.target.value)}
                                    className="bg-black border-zinc-700 border-green-900/30 focus:border-green-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Instagram size={16} /> Instagram URL</Label>
                                <Input
                                    placeholder="https://instagram.com/..."
                                    value={formState.instagram_url}
                                    onChange={e => updateField('instagram_url', e.target.value)}
                                    className="bg-black border-zinc-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Facebook size={16} /> Facebook URL</Label>
                                <Input
                                    placeholder="https://facebook.com/..."
                                    value={formState.facebook_link}
                                    onChange={e => updateField('facebook_link', e.target.value)}
                                    className="bg-black border-zinc-700"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- SEÇÃO 2: GRADE DE HORÁRIOS --- */}
            <Card className="bg-[#111] border-zinc-800">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <CardTitle className="text-yellow-500 flex items-center gap-2">
                                <Clock /> Grade de Horários
                            </CardTitle>
                            <CardDescription>Defina os horários de funcionamento.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                            <span className="text-xs text-zinc-400">Tempo de Corte:</span>
                            <Input
                                type="number"
                                className="w-16 h-8 bg-black border-zinc-700 text-center"
                                value={formState.grade_horarios[1]?.slot_duration || 30}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 30
                                    const newHours = formState.grade_horarios.map((h: any) => ({ ...h, slot_duration: val }))
                                    setFormState(prev => ({ ...prev, grade_horarios: newHours }))
                                }}
                            />
                            <span className="text-xs text-zinc-400">min</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {formState.grade_horarios.map((day: any, index: number) => (
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

                                <Button variant="outline" size="sm" onClick={() => setEditingDayIndex(index)} className="border-zinc-700 hover:bg-zinc-800 text-xs">
                                    <Edit2 className="w-3 h-3 mr-2" /> Editar
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* --- FLOATING SAVE BUTTON --- */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-900/80 backdrop-blur-md border-t border-zinc-800 flex justify-center z-50">
                <Button
                    onClick={handleSaveAll}
                    disabled={loading}
                    className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold shadow-xl w-full max-w-md h-12 text-lg transform hover:scale-105 transition-all"
                >
                    {loading ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                    SALVAR TODAS AS ALTERAÇÕES
                </Button>
            </div>

            {/* --- DIALOG DE EDIÇÃO DE HORÁRIO --- */}
            <Dialog open={editingDayIndex !== null} onOpenChange={(open) => !open && setEditingDayIndex(null)}>
                <DialogContent className="bg-[#111] border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Editar {editingDayIndex !== null ? DAYS[editingDayIndex] : ''}</DialogTitle>
                        <DialogDescription>Ajuste os horários para este dia.</DialogDescription>
                    </DialogHeader>

                    {editingDayIndex !== null && (
                        <div className="space-y-6 py-4">
                            <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                                <Label>Dia Aberto?</Label>
                                <Switch
                                    checked={!formState.grade_horarios[editingDayIndex].is_closed}
                                    onCheckedChange={(c) => updateHour(editingDayIndex, 'is_closed', !c)}
                                    className="data-[state=checked]:bg-green-600"
                                />
                            </div>

                            {!formState.grade_horarios[editingDayIndex].is_closed && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Abertura</Label>
                                            <Input
                                                type="time"
                                                value={formState.grade_horarios[editingDayIndex].start_time}
                                                onChange={(e) => updateHour(editingDayIndex, 'start_time', e.target.value)}
                                                className="bg-black border-zinc-700"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Fechamento</Label>
                                            <Input
                                                type="time"
                                                value={formState.grade_horarios[editingDayIndex].end_time}
                                                onChange={(e) => updateHour(editingDayIndex, 'end_time', e.target.value)}
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
                                                    value={formState.grade_horarios[editingDayIndex].lunch_start || ''}
                                                    onChange={(e) => updateHour(editingDayIndex, 'lunch_start', e.target.value)}
                                                    className="bg-black border-zinc-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Fim</Label>
                                                <Input
                                                    type="time"
                                                    value={formState.grade_horarios[editingDayIndex].lunch_end || ''}
                                                    onChange={(e) => updateHour(editingDayIndex, 'lunch_end', e.target.value)}
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
                        {editingDayIndex !== null && !formState.grade_horarios[editingDayIndex].is_closed && (
                            <Button type="button" variant="outline" onClick={applyToWeek} className="border-blue-900 text-blue-400 hover:bg-blue-900/20">
                                Copiar p/ Seg-Sex
                            </Button>
                        )}
                        <Button onClick={() => setEditingDayIndex(null)} className="bg-white text-black hover:bg-zinc-200">
                            Concluir (Não salva ainda)
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
