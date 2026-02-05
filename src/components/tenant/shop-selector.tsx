"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Store } from "lucide-react"

type Shop = {
    id: string
    name: string
    slug: string
}

export function ShopSelector({ shops, userId }: { shops: Shop[], userId: string }) {
    const router = useRouter()
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleSelect = async (shopId: string) => {
        setLoadingId(shopId)
        try {
            const res = await fetch('/api/tenant/set', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shopId })
            })

            if (res.ok) {
                router.refresh()
            } else {
                alert('Erro ao selecionar loja')
                setLoadingId(null)
            }
        } catch (error) {
            console.error(error)
            setLoadingId(null)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center mb-4">
                        <Store className="text-[#d4af37]" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Selecione a Barbearia</h1>
                    <p className="text-zinc-400 text-sm">
                        Detectamos múltiplas lojas para seu usuário.
                        <br />Qual ambiente você deseja acessar agora?
                    </p>
                    <p className="text-xs text-zinc-600 mt-2 font-mono">User: {userId}</p>
                </div>

                <div className="space-y-3">
                    {shops.map((shop) => (
                        <button
                            key={shop.id}
                            onClick={() => handleSelect(shop.id)}
                            disabled={!!loadingId}
                            className={`
                                w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left group
                                ${loadingId === shop.id
                                    ? 'bg-[#d4af37]/20 border-[#d4af37] cursor-wait'
                                    : 'bg-black border-zinc-800 hover:border-[#d4af37]/50 hover:bg-zinc-900'}
                            `}
                        >
                            <div>
                                <h3 className="text-white font-medium group-hover:text-[#d4af37] transition-colors">
                                    {shop.name}
                                </h3>
                                <p className="text-xs text-zinc-500 font-mono">/{shop.slug}</p>
                            </div>
                            {loadingId === shop.id && (
                                <Loader2 className="animate-spin text-[#d4af37]" size={20} />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
