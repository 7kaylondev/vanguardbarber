
'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { updateShopSettings } from "@/app/(main)/dashboard/actions"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, Wand2, RefreshCw, Layers } from "lucide-react"
import { MobileMockup } from "./designer/mobile-mockup"
import { cn } from "@/lib/utils"

const PRESET_BACKGROUNDS = [
    "https://images.unsplash.com/photo-1621644827024-e8a6c90335e6?q=80&w=1974&auto=format&fit=crop", // Dark Wood
    "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2600&auto=format&fit=crop", // Marble
    "https://images.unsplash.com/photo-1590402494587-44b71d9770b0?q=80&w=2070&auto=format&fit=crop", // Concrete
    "https://images.unsplash.com/photo-1503951914875-452162b7f30a?q=80&w=2070&auto=format&fit=crop", // Vintage Shop
]

export function ShopSettingsForm({ shop }: { shop: any }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: shop?.name || '',
        bio: shop?.bio || '',
        primary_color: shop?.primary_color || '#d4af37',
        instagram_url: shop?.instagram_url || '',
        whatsapp: shop?.whatsapp || '',
        logo_url: shop?.logo_url || '',
        banner_url: shop?.banner_url || '',
        notice_msg: shop?.notice_msg || '',
        modulo_produtos_ativo: shop?.modulo_produtos_ativo ?? true,
        modulo_agendamento_ativo: shop?.modulo_agendamento_ativo ?? true,
        modulo_sobre_nos_ativo: shop?.modulo_sobre_nos_ativo ?? true
    })

    const handleSwitch = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }))
    }

    // Update form when inputs change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const setPresetBanner = (url: string) => {
        setFormData(prev => ({ ...prev, banner_url: url }))
    }

    // Color Extractor Simulation
    const extractColor = () => {
        toast.info("Sugerindo cor baseada no logo...")
        // Simple logic for now: Random popular gold/dark hexes
        const colors = ['#d4af37', '#C0C0C0', '#cd7f32', '#B8860B', '#DAA520']
        const random = colors[Math.floor(Math.random() * colors.length)]
        setFormData(prev => ({ ...prev, primary_color: random }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault() // Handle manual submission to use state
        setLoading(true)

        const data = new FormData()
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value || '')
        })

        const res = await updateShopSettings(data)
        setLoading(false)

        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success("Vitrine atualizada com sucesso!")
        }
    }

    return (
        <div className="grid lg:grid-cols-2 gap-8 items-start">

            {/* LEFT: FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="bg-[#111]/80 backdrop-blur-md border-zinc-800 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-yellow-500 flex items-center gap-2">
                            <Wand2 size={18} /> Designer Mode
                        </CardTitle>
                        <CardDescription>Edite e veja as mudanças em tempo real.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {/* Identity */}
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input name="name" value={formData.name} onChange={handleChange} className="bg-black/50 border-zinc-700" />
                        </div>

                        {/* Visual Assets */}
                        <div className="space-y-3 pt-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ativos Visuais</Label>

                            <div className="grid gap-2">
                                <Label>Logo URL</Label>
                                <div className="flex gap-2">
                                    <Input name="logo_url" value={formData.logo_url} onChange={handleChange} className="bg-black/50 border-zinc-700" placeholder="https://..." />
                                    <Button type="button" variant="outline" size="icon" onClick={extractColor} title="Extrair Cor" className="border-zinc-700 hover:bg-zinc-800">
                                        <RefreshCw size={14} />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Banner Background</Label>
                                <Input name="banner_url" value={formData.banner_url} onChange={handleChange} className="bg-black/50 border-zinc-700" placeholder="https://..." />
                                {/* Presets */}
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {PRESET_BACKGROUNDS.map((url, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setPresetBanner(url)}
                                            className="h-10 w-10 rounded-md border border-zinc-800 hover:border-white transition-all bg-cover bg-center shrink-0"
                                            style={{ backgroundImage: `url(${url})` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* MODULES CARD */}
                        <div className="space-y-3 pt-4 border-t border-zinc-800">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Layers size={12} /> Seções da Vitrine
                            </Label>

                            <div className="bg-black/50 border border-zinc-800 rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base text-gray-200">Agendamento</Label>
                                        <p className="text-xs text-gray-500">Exibir calendário de horários.</p>
                                    </div>
                                    <Switch
                                        checked={formData.modulo_agendamento_ativo}
                                        onCheckedChange={(c) => handleSwitch('modulo_agendamento_ativo', c)}
                                        className="data-[state=checked]:bg-[#d4af37]"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base text-gray-200">Produtos</Label>
                                        <p className="text-xs text-gray-500">Exibir catálogo de vendas.</p>
                                    </div>
                                    <Switch
                                        checked={formData.modulo_produtos_ativo}
                                        onCheckedChange={(c) => handleSwitch('modulo_produtos_ativo', c)}
                                        className="data-[state=checked]:bg-[#d4af37]"
                                    />
                                </div>
                                {!formData.modulo_produtos_ativo && (
                                    <p className="text-[10px] text-red-400 bg-red-900/10 p-2 rounded border border-red-900/30 animate-in fade-in">
                                        Esta seção não será mais visível para seus clientes na vitrine digital.
                                    </p>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base text-gray-200">Sobre Nós</Label>
                                        <p className="text-xs text-gray-500">Exibir biografia.</p>
                                    </div>
                                    <Switch
                                        checked={formData.modulo_sobre_nos_ativo}
                                        onCheckedChange={(c) => handleSwitch('modulo_sobre_nos_ativo', c)}
                                        className="data-[state=checked]:bg-[#d4af37]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Colors & Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cor Principal</Label>
                                <div className="flex gap-2">
                                    <Input name="primary_color" value={formData.primary_color} onChange={handleChange} className="bg-black/50 border-zinc-700 font-mono" />
                                    <div className="w-10 h-10 rounded border border-white/10 shrink-0" style={{ backgroundColor: formData.primary_color }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>WhatsApp</Label>
                                <Input name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="bg-black/50 border-zinc-700" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Aviso do Dia (Banner Topo)</Label>
                            <Input
                                name="notice_msg"
                                value={formData.notice_msg}
                                onChange={handleChange}
                                placeholder="Ex: Hoje abriremos até as 22h!"
                                className="bg-black/50 border-zinc-700 text-red-300 placeholder:text-red-900/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Bio</Label>
                            <Textarea name="bio" value={formData.bio} onChange={handleChange} className="bg-black/50 border-zinc-700 h-20" />
                        </div>

                    </CardContent>
                </Card>

                <div className="flex justify-end sticky bottom-4 z-50">
                    <Button disabled={loading} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Alterações
                    </Button>
                </div>
            </form>

            {/* RIGHT: MOCKUP */}
            <div className="sticky top-8 hidden lg:block">
                <div className="text-center mb-4">
                    <span className="bg-zinc-800 text-zinc-400 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                        Live Preview (Mobile)
                    </span>
                </div>
                <MobileMockup data={formData} />
            </div>

        </div>
    )
}
