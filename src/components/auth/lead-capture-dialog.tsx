
'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Send, Loader2, Smartphone } from 'lucide-react'

export function LeadCaptureDialog() {
    const [open, setOpen] = useState(false)
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
            // 1. Validate inputs basic
            if (!formData.name || !formData.barbershop || !formData.whatsapp || !formData.email) {
                toast.error("Preencha todos os campos.")
                setLoading(false)
                return
            }

            const supabase = createClient()

            // 2. Save to Supabase
            const { error } = await supabase.from('leads').insert({
                barber_name: formData.name,
                barbershop_name: formData.barbershop,
                whatsapp: formData.whatsapp,
                email: formData.email, // Ensure this column exists in DB
                status: 'pending'
            })

            if (error) {
                console.error(error)
                throw new Error("Erro ao salvar lead")
            }

            // 3. Success Feedback (Updated per user request)
            toast.success("Solicitação enviada com sucesso! Nossa equipe entrará em contato em breve. Aguarde a Vanguarda.", {
                duration: 5000,
            })
            setOpen(false)
            setFormData({ name: '', barbershop: '', whatsapp: '', email: '' })


        } catch (error) {
            console.error(error)
            toast.error("Erro ao enviar solicitação. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37]/10 bg-transparent h-10 text-xs uppercase tracking-wider">
                    <Smartphone size={14} className="mr-2" />
                    Solicite Acesso Antecipado
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0A0A0A] border-[#d4af37]/30 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-serif text-[#d4af37]">Solicitar Acesso Vanguard</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Preencha seus dados. Entraremos em contato via WhatsApp para liberar sua licença exclusiva.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* ... Inputs ... */}
                    <div className="space-y-2">
                        <Label htmlFor="lead-name" className="text-gray-300">Seu Nome</Label>
                        <Input
                            id="lead-name"
                            name="name"
                            placeholder="Ex: Carlos Silva"
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-[#111] border-[#333] focus:border-[#d4af37]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lead-shop" className="text-gray-300">Nome da Barbearia</Label>
                        <Input
                            id="lead-shop"
                            name="barbershop"
                            placeholder="Ex: Barbearia do Futuro"
                            value={formData.barbershop}
                            onChange={handleChange}
                            className="bg-[#111] border-[#333] focus:border-[#d4af37]"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="lead-whatsapp" className="text-gray-300">WhatsApp</Label>
                            <Input
                                id="lead-whatsapp"
                                name="whatsapp"
                                placeholder="(00) 99999-9999"
                                value={formData.whatsapp}
                                onChange={handleChange}
                                className="bg-[#111] border-[#333] focus:border-[#d4af37]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lead-email" className="text-gray-300">Email Comercial</Label>
                            <Input
                                id="lead-email"
                                name="email"
                                type="email"
                                placeholder="barber@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="bg-[#111] border-[#333] focus:border-[#d4af37]"
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full bg-[#d4af37] text-black hover:bg-white font-bold" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                        {loading ? "Enviando..." : "Enviar Solicitação"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
