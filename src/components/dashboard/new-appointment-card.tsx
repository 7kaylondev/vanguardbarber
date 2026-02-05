
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { NewAppointmentDialog } from "./new-appointment-dialog"
import { QuickSaleDialog } from "./quick-sale-dialog"
import { Calendar, ShoppingCart } from "lucide-react"

interface NewAppointmentCardProps {
    slug: string
    shopId: string
    hideQuickSale?: boolean
}

export function NewAppointmentCard({ slug, shopId, hideQuickSale = false }: NewAppointmentCardProps) {
    const [isApptOpen, setIsApptOpen] = useState(false)
    const [isSaleOpen, setIsSaleOpen] = useState(false)

    return (
        <>
            <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 p-4 sm:p-6 rounded-xl space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-[#d4af37] font-bold text-lg">Ações Rápidas</h3>
                </div>

                <div
                    className={`grid ${hideQuickSale ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}
                    suppressHydrationWarning
                >
                    <Button
                        className="h-auto py-4 flex flex-col items-center gap-2 bg-[#d4af37] text-black hover:bg-[#b5952f] font-bold"
                        onClick={() => setIsApptOpen(true)}
                    >
                        <Calendar className="h-5 w-5" />
                        <span className="text-xs sm:text-sm">Agendar</span>
                    </Button>

                    {!hideQuickSale && (
                        <Button
                            className="h-auto py-4 flex flex-col items-center gap-2 bg-zinc-800 text-white hover:bg-zinc-700 font-bold border border-zinc-700"
                            onClick={() => setIsSaleOpen(true)}
                        >
                            <ShoppingCart className="h-5 w-5 text-[#d4af37]" />
                            <span className="text-xs sm:text-sm">Venda Rápida</span>
                        </Button>
                    )}
                </div>
            </div>

            <NewAppointmentDialog
                isOpen={isApptOpen}
                onOpenChange={setIsApptOpen}
                slug={slug}
                shopId={shopId}
            />

            <QuickSaleDialog
                isOpen={isSaleOpen}
                onOpenChange={setIsSaleOpen}
                slug={slug}
                shopId={shopId}
            />
        </>
    )
}
