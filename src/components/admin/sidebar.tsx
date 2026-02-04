
'use client'

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    LogOut,
    Scissors
} from "lucide-react"
import { signOut } from "@/app/actions/auth"
import { cn } from "@/lib/utils"
import { MENU_GROUPS } from "@/config/dashboard-menu"

// Force refresh
export function DashboardSidebar({ shopSlug }: { shopSlug?: string }) {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-black border-r border-[#d4af37]/20 flex flex-col h-screen fixed left-0 top-0 z-50 text-gray-400">
            {/* Brand */}
            <div className="h-20 flex items-center gap-3 px-6 border-b border-[#d4af37]/10">
                <div className="h-8 w-8 bg-[#d4af37] rounded-lg flex items-center justify-center text-black shadow-[0_0_15px_#d4af37_40]">
                    <Scissors size={20} fill="currentColor" />
                </div>
                <span className="text-xl font-bold text-white tracking-wide font-serif">VANGUARD BARBER</span>
            </div>

            {/* View Showcase Button */}
            {shopSlug && (
                <div className="mx-4 mt-4 mb-2">
                    <Link
                        href={`/v/${shopSlug}`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full bg-[#d4af37]/10 border border-[#d4af37]/20 hover:bg-[#d4af37]/20 text-[#d4af37] py-2 rounded-lg text-xs uppercase font-bold tracking-widest transition-all shadow-[0_0_10px_rgba(212,175,55,0.1)] hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    >
                        <span>Minha Vitrine</span>
                        <div className="bg-[#d4af37] text-black rounded-full p-0.5">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-right"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
                        </div>
                    </Link>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-8">
                {MENU_GROUPS.map((group) => (
                    <div key={group.title}>
                        <h3 className="text-[10px] font-bold text-[#d4af37] tracking-[0.2em] mb-4 ml-3 uppercase opacity-80">
                            {group.title}
                        </h3>
                        <ul className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <li key={item.href}>
                                        <Link href={item.href} className="block relative group">
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeNav"
                                                    className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#d4af37] shadow-[0_0_12px_#d4af37]"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            )}
                                            <div className={cn(
                                                "flex items-center gap-3 px-3 py-3 rounded-r-lg transition-all duration-300",
                                                isActive
                                                    ? "bg-gradient-to-r from-[#d4af37]/10 to-transparent text-white pl-5"
                                                    : "hover:text-white hover:bg-white/5 pl-3"
                                            )}>
                                                <item.icon size={18} className={cn(
                                                    "transition-colors duration-300",
                                                    isActive ? "text-[#d4af37]" : "text-gray-500 group-hover:text-gray-300"
                                                )} />
                                                <span className="text-sm font-medium tracking-wide">{item.label}</span>
                                            </div>
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-[#d4af37]/10 bg-black/50">
                <form action={signOut}>
                    <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-500 hover:bg-red-950/20 transition-all hover:pl-6">
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Sair do Sistema</span>
                    </button>
                </form>
            </div>
        </aside>
    )
}
