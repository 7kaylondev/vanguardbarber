"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"

interface QuickReportSummaryProps {
    reportData: {
        totalService: number
        totalProduct: number
        totalApps: number
        ticketAvg: number
    }
}

export function QuickReportSummary({ reportData }: QuickReportSummaryProps) {
    const total = reportData.totalService + reportData.totalProduct

    const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    const pct = (v: number) => total > 0 ? ((v / total) * 100).toFixed(0) + '%' : '0%'

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10 gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Resumo Rápido
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Resumo de Consumo</DialogTitle>
                    <DialogDescription>
                        Performance do período selecionado.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Big Total */}
                    <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Faturamento Total</span>
                        <span className="text-4xl font-bold text-[#d4af37] mt-1">{fmt(total)}</span>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#111] p-4 rounded-lg border border-zinc-800 text-center">
                            <div className="text-sm text-zinc-400 mb-1">Serviços</div>
                            <div className="text-xl font-bold text-white mb-1">{fmt(reportData.totalService)}</div>
                            <div className="text-xs text-zinc-500 bg-zinc-900 rounded-full py-0.5 px-2 inline-block">
                                {pct(reportData.totalService)}
                            </div>
                        </div>
                        <div className="bg-[#111] p-4 rounded-lg border border-zinc-800 text-center">
                            <div className="text-sm text-zinc-400 mb-1">Produtos/Consumo</div>
                            <div className="text-xl font-bold text-white mb-1">{fmt(reportData.totalProduct)}</div>
                            <div className="text-xs text-zinc-500 bg-zinc-900 rounded-full py-0.5 px-2 inline-block">
                                {pct(reportData.totalProduct)}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm p-3 bg-zinc-900/30 rounded border border-zinc-800/50">
                            <span className="text-zinc-400">Atendimentos</span>
                            <span className="font-mono text-white">{reportData.totalApps}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-3 bg-zinc-900/30 rounded border border-zinc-800/50">
                            <span className="text-zinc-400">Ticket Médio</span>
                            <span className="font-mono text-white">{fmt(reportData.ticketAvg)}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
