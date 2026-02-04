
'use client'

import { useEffect, useState } from "react"
import { repairShopLink } from "@/app/(main)/dashboard/repair-action"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"

export function DashboardHeader({ initialShopName }: { initialShopName?: string }) {
    const [shopName, setShopName] = useState(initialShopName)
    const [checking, setChecking] = useState(!initialShopName)

    useEffect(() => {
        if (!initialShopName) {
            // Self-repair attempt
            const attemptRepair = async () => {
                const res = await repairShopLink()
                if (res.success && res.repaired) {
                    window.location.reload() // Force reload to pick up new shop context
                } else {
                    setChecking(false)
                }
            }
            attemptRepair()
        }
    }, [initialShopName])

    return (
        <div className="h-16 border-b border-[#d4af37]/10 bg-black/50 backdrop-blur flex items-center px-8 justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <h2 className="text-gray-400 font-mono text-sm uppercase tracking-widest">Painel de Gestão</h2>
                <div className="h-4 w-[1px] bg-zinc-700"></div>
                {checking ? (
                    <div className="flex items-center gap-2 text-yellow-600 animate-pulse text-xs">
                        <RefreshCw className="h-3 w-3 animate-spin" /> Buscando vínculo...
                    </div>
                ) : (
                    <span className="text-[#d4af37] font-bold text-lg">
                        {shopName || <span className="text-red-900">Sem Vínculo</span>}
                    </span>
                )}
            </div>
            {/* Could add user profile here */}
        </div>
    )
}
