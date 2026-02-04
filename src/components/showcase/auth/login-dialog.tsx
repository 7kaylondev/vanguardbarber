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

interface LoginDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSwitchToRegister: () => void
}

export function LoginDialog({ isOpen, onOpenChange, onSwitchToRegister }: LoginDialogProps) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        setLoading(false)

        if (error) {
            console.error("Login Error:", error)
            if (error.message.includes("Email not confirmed")) {
                toast.error("Verifique seu email para confirmar o cadastro antes de entrar.")
            } else if (error.message.includes("Invalid login credentials")) {
                toast.error("Email ou senha incorretos.")
            } else if (error.message.includes("Email logins are disabled")) {
                toast.error("Login por Email desativado no sistema (Supabase).")
            } else {
                toast.error("Erro ao entrar: " + error.message)
            }
            return
        }

        toast.success("Login realizado com sucesso!")
        onOpenChange(false)
        router.refresh()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Entrar na Conta</DialogTitle>
                    <DialogDescription>Acesse seu perfil, histórico e clube.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleLogin} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            placeholder="seu@email.com"
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
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f]" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Entrar
                    </Button>
                </form>

                <div className="text-center text-sm text-zinc-500">
                    Ainda não tem conta?{" "}
                    <button onClick={onSwitchToRegister} className="text-[#d4af37] hover:underline">
                        Cadastre-se
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
