
'use client'

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, LogOut, Scissors } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/app/actions/auth"
import { MENU_GROUPS } from "@/config/dashboard-menu"
import { cn } from "@/lib/utils"

export function MobileSidebar({ shopSlug }: { shopSlug?: string }) {
    const pathname = usePathname()

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-[#d4af37]">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-black border-r border-[#d4af37]/20 p-0 flex flex-col text-gray-400">
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <SheetDescription className="sr-only">Menu principal do dashboard</SheetDescription>

                <div className="p-6 flex items-center gap-3 border-b border-[#d4af37]/20 h-16">
                    <div className="h-8 w-8 bg-[#d4af37] rounded-lg flex items-center justify-center text-black">
                        <Scissors size={20} fill="currentColor" />
                    </div>
                    <span className="font-serif font-bold text-xl text-white tracking-wide">VANGUARD</span>
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

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                    {MENU_GROUPS.map((group) => (
                        <div key={group.title}>
                            <h3 className="text-[10px] font-bold text-[#d4af37] tracking-[0.2em] mb-3 ml-2 uppercase opacity-80">
                                {group.title}
                            </h3>
                            <ul className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <li key={item.href}>
                                            <Link href={item.href}>
                                                <div className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                                                    isActive
                                                        ? "bg-[#d4af37]/10 text-white"
                                                        : "hover:text-white hover:bg-white/5"
                                                )}>
                                                    <item.icon size={18} className={isActive ? "text-[#d4af37]" : "text-gray-500"} />
                                                    <span className="text-sm font-medium">{item.label}</span>
                                                </div>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-[#d4af37]/20 bg-black/50">
                    <form action={signOut}>
                        <Button variant="ghost" className="w-full justify-start text-red-500 hover:bg-red-950/20 hover:text-red-400">
                            <LogOut className="mr-3 h-4 w-4" />
                            Sair do Sistema
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    )
}
