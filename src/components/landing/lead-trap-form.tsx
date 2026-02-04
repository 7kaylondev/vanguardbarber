
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Send, ArrowRight, Loader2 } from 'lucide-react'

export function LeadTrapForm() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        barbershop: '',
        whatsapp: '',
        email: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const supabase = createClient()

            // 1. Save to Supabase
            const { error } = await supabase.from('leads').insert({
                barber_name: formData.name,
                barbershop_name: formData.barbershop,
                whatsapp: formData.whatsapp,
                email: formData.email
            })

            if (error) throw error

            // 2. Redirect to WhatsApp
            const message = `Olá, meu nome é *${formData.name}* da barbearia *${formData.barbershop}*. Gostaria de saber mais sobre o Vanguarda Barber!`
            const waLink = `https://wa.me/5581999999999?text=${encodeURIComponent(message)}`

            toast.success("Cadastro recebido! Redirecionando...")

            // Small delay for effect
            setTimeout(() => {
                window.location.href = waLink
            }, 1000)

        } catch (error) {
            console.error(error)
            toast.error("Erro ao enviar cadastro. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto bg-black/50 backdrop-blur-md border border-[#d4af37]/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.1)]">
            <h3 className="text-2xl font-serif text-white mb-2 text-center">Entre para a Vanguarda</h3>
            <p className="text-gray-400 text-center mb-6 text-sm">Cadastre sua barbearia e entraremos em contato.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#d4af37]">Seu Nome</Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Ex: Carlos Silva"
                        className="bg-black/50 border-[#d4af37]/20 focus:border-[#d4af37] text-white"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="barbershop" className="text-[#d4af37]">Nome da Barbearia</Label>
                    <Input
                        id="barbershop"
                        name="barbershop"
                        placeholder="Ex: Barbearia do Futuro"
                        className="bg-black/50 border-[#d4af37]/20 focus:border-[#d4af37] text-white"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#d4af37]">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="bg-black/50 border-[#d4af37]/20 focus:border-[#d4af37] text-white"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-[#d4af37]">WhatsApp</Label>
                    <Input
                        id="whatsapp"
                        name="whatsapp"
                        placeholder="(00) 00000-0000"
                        className="bg-black/50 border-[#d4af37]/20 focus:border-[#d4af37] text-white"
                        onChange={handleChange}
                        required
                    />
                </div>

                <Button type="submit" className="w-full bg-[#d4af37] text-black hover:bg-[#b8860b] font-bold" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                    {loading ? "Enviando..." : "Quero Acesso Antecipado"}
                </Button>
            </form>
        </div>
    )
}
