
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { updateShopSettings } from "@/app/(main)/dashboard/actions"
import { Loader2, Save, Store, MapPin, Phone, DollarSign, Facebook, Instagram, AlertTriangle } from "lucide-react"

interface ShopGeneralSettingsProps {
    shop: any
}

export function ShopGeneralSettings({ shop }: ShopGeneralSettingsProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        status_manual: shop.status_manual || false,
        address: shop.address || '',
        whatsapp_orders: shop.whatsapp_orders || '',
        facebook_url: shop.facebook_url || '',
        instagram_url: shop.instagram_url || '',
        min_order_value: shop.min_order_value || 0
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSwitch = (checked: boolean) => {
        setFormData(prev => ({ ...prev, status_manual: checked }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        const data = new FormData()
        data.append('status_manual', String(formData.status_manual))
        data.append('address', formData.address)
        data.append('whatsapp_orders', formData.whatsapp_orders)
        data.append('facebook_url', formData.facebook_url)
        data.append('instagram_url', formData.instagram_url)
        data.append('min_order_value', String(formData.min_order_value))

        const res = await updateShopSettings(data)
        setLoading(false)

        if (res?.error) {
            toast.error("Erro ao salvar configurações.")
        } else {
            toast.success("Configurações atualizadas!")
        }
    }

    return (
        <Card className="bg-[#111] border-zinc-800 mb-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-500">
                    <Store size={20} /> Preferências da Loja
                </CardTitle>
                <CardDescription>Informações de contato e status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* EMERGENCY MODE */}
                <div className={`p-4 rounded-lg border flex items-center justify-between transition-colors ${formData.status_manual ? 'bg-red-900/20 border-red-800' : 'bg-zinc-900/50 border-zinc-800'}`}>
                    <div className="space-y-1">
                        <Label className={`text-base flex items-center gap-2 ${formData.status_manual ? 'text-red-400' : 'text-zinc-200'}`}>
                            {formData.status_manual && <AlertTriangle size={16} />}
                            Modo Emergência / Feriado
                        </Label>
                        <p className="text-xs text-zinc-500">
                            Se ativado, a loja aparecerá como <strong>FECHADA</strong> na vitrine, ignorando os horários.
                        </p>
                    </div>
                    <Switch
                        checked={formData.status_manual}
                        onCheckedChange={handleSwitch}
                        className="data-[state=checked]:bg-red-600"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Endereço Completo</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                            <Input
                                name="address"
                                placeholder="Rua Exemplo, 123 - Centro"
                                value={formData.address}
                                onChange={handleChange}
                                className="pl-9 bg-black border-zinc-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>WhatsApp de Pedidos (Opcional)</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                            <Input
                                name="whatsapp_orders"
                                placeholder="Se vazio, usa o principal"
                                value={formData.whatsapp_orders}
                                onChange={handleChange}
                                className="pl-9 bg-black border-zinc-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Link do Instagram</Label>
                        <div className="relative">
                            <Instagram className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                            <Input
                                name="instagram_url"
                                placeholder="https://instagram.com/..."
                                value={formData.instagram_url}
                                onChange={handleChange}
                                className="pl-9 bg-black border-zinc-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Link do Facebook</Label>
                        <div className="relative">
                            <Facebook className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                            <Input
                                name="facebook_url"
                                placeholder="https://facebook.com/..."
                                value={formData.facebook_url}
                                onChange={handleChange}
                                className="pl-9 bg-black border-zinc-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Valor Mínimo de Entrega (R$)</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                            <Input
                                name="min_order_value"
                                type="number"
                                placeholder="0.00"
                                value={formData.min_order_value}
                                onChange={handleChange}
                                className="pl-9 bg-black border-zinc-700"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSubmit} disabled={loading} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold">
                        {loading ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Preferências
                    </Button>
                </div>

            </CardContent>
        </Card>
    )
}
