
'use client'

import { Button } from "@/components/ui/button"
import { UserCheck, UserX, MessageSquare, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { approveLead, rejectLead } from "@/app/admin-command/actions"
import { useState } from "react"

export function LeadRowActions({ lead }: { lead: any }) {
    const [loading, setLoading] = useState(false)

    const handleApprove = async () => {
        setLoading(true)
        toast.info("Criando conta e vitrine...", { duration: 3000 })

        try {
            const result = await approveLead(lead.id)
            if (result.success) {
                // Show Credentials
                // TS Workaround: treating result as any to access credentials safely
                const creds = (result as any).credentials

                toast.success(
                    <div className="space-y-1">
                        <p className="font-bold">Aprovado! Credenciais:</p>
                        <p className="text-xs">User: {creds?.email}</p>
                        <p className="text-xs">Pass: {creds?.password}</p>
                        <p className="text-xs text-green-300">Vitrine: /v/{result.slug}</p>
                    </div>,
                    { duration: 10000 }
                )
                // Reload to update UI
                window.location.reload()
            } else {
                toast.error(`Falha: ${result.error}`)
            }
        } catch (e) {
            toast.error("Erro desconhecido.")
        } finally {
            setLoading(false)
        }
    }

    const handleReject = async () => {
        if (!confirm("Tem certeza que deseja rejeitar este lead?")) return

        setLoading(true)
        try {
            const result = await rejectLead(lead.id)
            if (result.success) {
                toast.success("Lead rejeitado.")
                window.location.reload()
            } else {
                toast.error(`Erro: ${result.error}`)
            }
        } catch (e) {
            toast.error("Erro ao rejeitar.")
        } finally {
            setLoading(false)
        }
    }

    if (lead.status === 'approved') return <span className="text-xs text-green-600 font-bold">FEITO</span>
    if (lead.status === 'rejected') return <span className="text-xs text-red-600 font-bold line-through opacity-50">REJEITADO</span>

    return (
        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-green-500 hover:bg-green-900/20 rounded-none"
                title="Aprovar e Criar Tenant"
                onClick={handleApprove}
                disabled={loading}
            >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-3 w-3" />}
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-white hover:bg-white/10 rounded-none" asChild title="Contatar no WhatsApp">
                <a href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`} target="_blank">
                    <MessageSquare className="h-3 w-3" />
                </a>
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-red-500 hover:bg-red-900/20 rounded-none"
                title="Rejeitar"
                onClick={handleReject}
                disabled={loading}
            >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserX className="h-3 w-3" />}
            </Button>
        </div>
    )
}
