
"use client"

import { motion } from "framer-motion"
import { ShoppingCart, Users, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
    balance: number
    revenue: number
    sales: number
    newClients: number
}

export function DashboardStats({ balance, revenue, sales, newClients }: DashboardStatsProps) {
    // Format Currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const stats = [
        {
            label: "Lucro Bruto",
            value: formatCurrency(revenue),
            description: "No período selecionado",
            icon: TrendingUp,
            color: "text-[#d4af37]"
        },
        {
            label: "Número de Vendas",
            value: sales.toString(),
            description: "No período selecionado",
            icon: ShoppingCart,
            color: "text-blue-500"
        },
        {
            label: "Clientes Novos",
            value: newClients.toString(),
            description: "Cadastrados no período",
            icon: Users,
            color: "text-purple-500"
        }
    ]

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative overflow-hidden rounded-xl border border-[#d4af37]/20 bg-black/40 backdrop-blur-xl p-6 hover:border-[#d4af37]/50 transition-colors group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-400">{stat.label}</h3>
                            <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
                        </div>
                        <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                            <stat.icon size={18} />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
