"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function PrintButton() {
    return (
        <Button
            type="button"
            onClick={() => window.print()}
            className="bg-[#d4af37] text-black hover:bg-[#b5952f] shrink-0 w-9 h-9 px-0 md:w-auto md:h-10 md:px-4"
        >
            <Printer className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Imprimir Relatório</span>
        </Button>
    )
}
