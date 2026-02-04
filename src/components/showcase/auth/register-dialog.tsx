"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { registerCustomerAction } from "@/app/actions/auth-showcase"

interface RegisterDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSwitchToLogin: () => void
    barbershopId: string // To link client
}

export function RegisterDialog({ isOpen, onOpenChange, onSwitchToLogin, barbershopId }: RegisterDialogProps) {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // 1. Call Server Action to Create User (Admin Bypasses Email Confirm)
        const result = await registerCustomerAction({
            name,
            email,
            phone,
            password,
            barbershopId
        })

        if (result.error) {
            console.error("Register Error:", result.error)
            toast.error(result.error)
            setLoading(false)
            return
        }

        // 2. Auto Login (User is created and confirmed, but we need a session)
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (loginError) {
            toast.error("Conta criada, mas erro ao entrar automaticamente: " + loginError.message)
            onSwitchToLogin() // Fallback to login screen
        } else {
            toast.success("Conta criada! Entrando...")
            onOpenChange(false)
            router.refresh()
        }

        setLoading(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Criar Conta</DialogTitle>
                    <DialogDescription>Cadastre-se para agendar e participar do clube.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleRegister} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <Input
                            className="bg-black border-zinc-800"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>WhatsApp / Celular</Label>
                        <Input
                            className="bg-black border-zinc-800"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="(00) 00000-0000"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            className="bg-black border-zinc-800"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Senha</Label>
                        <Input
                            type="password"
                            className="bg-black border-zinc-800"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            minLength={6}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f]" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Cadastrar
                    </Button>
                </form>

                <div className="text-center text-sm text-zinc-500">
                    Já tem conta?{" "}
                    <button onClick={onSwitchToLogin} className="text-[#d4af37] hover:underline">
                        Entrar
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
