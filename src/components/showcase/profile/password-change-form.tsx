"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2, LockKeyhole } from "lucide-react"

export function PasswordChangeForm() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres.")
            return
        }

        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem.")
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({ password })

            if (error) throw error

            toast.success("Senha alterada com sucesso!")
            setPassword('')
            setConfirmPassword('')

        } catch (error: any) {
            console.error("Error changing password:", error)
            toast.error("Erro ao alterar senha: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4 pt-6">
            <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-2">Segurança</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
                <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs uppercase font-bold">Nova Senha</Label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 focus:border-[#d4af37]"
                        placeholder="••••••"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs uppercase font-bold">Confirmar Nova Senha</Label>
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 focus:border-[#d4af37]"
                        placeholder="••••••"
                    />
                </div>

                <Button type="submit" disabled={loading || !password} variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 hover:text-white">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LockKeyhole className="w-4 h-4 mr-2" />}
                    Alterar Senha
                </Button>
            </form>
        </div>
    )
}
