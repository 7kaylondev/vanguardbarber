"use client"

import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export function ViewFutureReportsButton() {
    const handleNavigation = () => {
        window.location.href = '/dashboard/agenda-futura'
    }

    return (
        <Button
            variant="outline"
            className="w-full text-xs border-zinc-700 text-zinc-400 hover:text-white hover:border-[#d4af37]"
            onClick={handleNavigation}
        >
            Ver todos os futuros
        </Button>
    )
}
