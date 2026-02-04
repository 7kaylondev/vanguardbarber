
"use client"

import { motion } from "framer-motion"
import { ShoppingCart, Users, TrendingUp, Scissors, ShoppingBag } from "lucide-react"

interface DashboardStatsProps {
    balance: number
    revenue: number
    sales: number
    newClients: number
}

export function DashboardStats({ balance, revenue, revenueServices, revenueProducts, sales, newClients }: DashboardStatsProps & { revenueServices: number, revenueProducts: number }) {
    // Format Currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const stats = [
        {
            label: "Faturamento Total",
            value: formatCurrency(revenue),
            description: "Serviços + Produtos",
            icon: TrendingUp,
            color: "text-[#d4af37]",
            colSpan: "lg:col-span-1"
        },
        {
            label: "Serviços (Cortes)",
            value: formatCurrency(revenueServices),
            description: "Agendamentos concluídos",
            icon: Scissors,
            color: "text-blue-500",
            colSpan: "lg:col-span-1"
        },
        {
            label: "Produtos (Vendas)",
            value: formatCurrency(revenueProducts),
            description: "Itens adicionais vendidos",
            icon: ShoppingBag,
            color: "text-purple-500",
            colSpan: "lg:col-span-1"
        },
        {
            label: "Número de Vendas",
            value: sales.toString(),
            description: "Total de atendimentos",
            icon: ShoppingCart,
            color: "text-green-500",
            colSpan: "lg:col-span-1"
        },
        {
            label: "Clientes Novos",
            value: newClients.toString(),
            description: "Cadastrados no período",
            icon: Users,
            color: "text-indigo-500",
            colSpan: "lg:col-span-1"
        }
    ]

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative overflow-hidden rounded-xl border border-[#d4af37]/20 bg-black/40 backdrop-blur-xl p-6 hover:border-[#d4af37]/50 transition-colors group ${stat.colSpan}`}
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
