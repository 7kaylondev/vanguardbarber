
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { NewAppointmentDialog } from "./new-appointment-dialog"

interface NewAppointmentCardProps {
    slug: string
    shopId: string
}

export function NewAppointmentCard({ slug, shopId }: NewAppointmentCardProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 p-6 rounded-xl text-center space-y-4">
                <h3 className="text-[#d4af37] font-bold text-lg">Ação Rápida</h3>
                <Button
                    className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f] font-bold"
                    onClick={() => setIsOpen(true)}
                >
                    Novo Agendamento
                </Button>
            </div>

            <NewAppointmentDialog
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                slug={slug}
                shopId={shopId}
            />
        </>
    )
}
