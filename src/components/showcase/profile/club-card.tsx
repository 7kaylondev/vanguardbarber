"use client"

import { Crown, Check } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ClubCardProps {
    client: any
    plan: any
    shopSlug: string
}

export function ClubCard({ client, plan, shopSlug }: ClubCardProps) {
    const isActive = client?.club_status === 'active'

    if (!isActive || !plan) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500">
                    <Crown size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Faça parte do Clube</h3>
                    <p className="text-sm text-zinc-400">Assine e garanta cortes ilimitados e descontos.</p>
                </div>
                {/* Could link to a plan selection section or just info */}
                <div className="text-xs text-[#d4af37]">Disponível na barbearia</div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-[#d4af37]/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Crown size={100} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">Membro VIP</span>
                        <h3 className="text-2xl font-bold text-white mt-1">{plan.name}</h3>
                    </div>
                    <div className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded border border-green-500/20 flex items-center gap-1">
                        <Check size={12} /> Ativo
                    </div>
                </div>

                <div className="space-y-2 mt-6">
                    <div className="text-sm text-zinc-400">
                        Válido até <span className="text-white font-bold">
                            {client.club_validity ? format(new Date(client.club_validity), "d 'de' MMMM", { locale: ptBR }) : 'Indefinido'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
