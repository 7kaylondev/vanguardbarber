"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { syncUserProfile } from "@/app/(main)/dashboard/actions"

interface ProfileEditFormProps {
    user: any
    client: any
}

export function ProfileEditForm({ user, client }: ProfileEditFormProps) {
    const [name, setName] = useState(client?.name || user.user_metadata?.name || '')
    const [phone, setPhone] = useState(client?.phone || user.user_metadata?.phone || '')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Phone Mask
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '')
        if (val.length > 11) val = val.substring(0, 11)
        val = val.replace(/^(\d{2})(\d)/g, '($1) $2')
        val = val.replace(/(\d{5})(\d)/, '$1-$2')
        setPhone(val)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Sync with Server Action (Database + Cache Revalidation)
            const result = await syncUserProfile({ name, phone })

            if (result.error) {
                throw new Error(result.error)
            }

            toast.success("Dados atualizados com sucesso!")
            router.refresh()

        } catch (error: any) {
            console.error("Error updating profile:", error)
            toast.error("Erro ao atualizar perfil. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-2">Meus Dados</h3>
            <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs uppercase font-bold">Nome Completo</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 focus:border-[#d4af37]"
                        placeholder="Seu nome"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs uppercase font-bold">WhatsApp / Telefone</Label>
                    <Input
                        value={phone}
                        onChange={handlePhoneChange}
                        maxLength={15}
                        className="bg-zinc-900 border-zinc-800 focus:border-[#d4af37]"
                        placeholder="(00) 00000-0000"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs uppercase font-bold">Email (Não editável)</Label>
                    <Input
                        value={user.email}
                        disabled
                        className="bg-zinc-900/50 border-zinc-800 text-zinc-500 cursor-not-allowed"
                    />
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f] font-bold">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar Alterações
                </Button>
            </form>
        </div>
    )
}
