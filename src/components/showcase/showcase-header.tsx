"use client"

import { useState } from "react"
import { Scissors, Star, MapPin, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import { useShowcaseAuth } from "./auth/showcase-auth-provider"
import { LoginDialog } from "./auth/login-dialog"
import { RegisterDialog } from "./auth/register-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ShowcaseHeaderProps {
    shop: any
    hours: any[]
}

export function ShowcaseHeader({ shop, hours }: ShowcaseHeaderProps) {
    const { user, loading, signOut } = useShowcaseAuth()
    const [loginOpen, setLoginOpen] = useState(false)
    const [registerOpen, setRegisterOpen] = useState(false)

    const primaryColor = shop.primary_color || '#d4af37'

    return (
        <header className="relative h-64 md:h-80 bg-zinc-900 overflow-hidden">
            {shop.banner_url ? (
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${shop.banner_url})` }} />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
            )}
            <div className="absolute inset-0 bg-black/60" />

            {/* AUTH BUTTON TOP RIGHT */}
            <div className="absolute top-4 right-4 z-20">
                {!loading && (
                    user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="rounded-full w-10 h-10 p-0 border-2 border-zinc-800 bg-black hover:bg-zinc-900">
                                    <Avatar className="w-full h-full">
                                        <AvatarImage src={user.user_metadata?.avatar_url} />
                                        <AvatarFallback className="bg-zinc-800 text-yellow-500 font-bold">
                                            {user.user_metadata?.name?.substring(0, 2).toUpperCase() || <User size={18} />}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-zinc-950 border-zinc-800 text-white" align="end">
                                <DropdownMenuLabel>{user.user_metadata?.name || 'Minha Conta'}</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-zinc-800" />
                                <Link href={`/v/${shop.slug}/perfil`}>
                                    <DropdownMenuItem className="cursor-pointer focus:bg-zinc-900 focus:text-white">
                                        <User className="mr-2 h-4 w-4" /> Perfil e Clube
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator className="bg-zinc-800" />
                                <DropdownMenuItem onClick={signOut} className="text-red-400 focus:text-red-300 focus:bg-red-900/20 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" /> Sair
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button
                            onClick={() => setLoginOpen(true)}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20"
                        >
                            <User className="mr-2 h-4 w-4" /> Entrar
                        </Button>
                    )
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 bg-gradient-to-t from-black to-transparent">
                <div className="container mx-auto flex items-end gap-6">
                    {/* LOGO */}
                    <div className="h-24 w-24 md:h-32 md:w-32 bg-black border-2 rounded-2xl flex items-center justify-center shadow-2xl shrink-0 overflow-hidden"
                        style={{ borderColor: primaryColor }}>
                        {shop.logo_url ? (
                            <img src={shop.logo_url} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <Scissors className="h-10 w-10 md:h-14 md:w-14" style={{ color: primaryColor }} />
                        )}
                    </div>

                    {/* INFO */}
                    <div className="space-y-1 md:mb-2 flex-1">
                        <h1 className="text-2xl md:text-5xl font-bold font-serif text-white leading-tight">{shop.name}</h1>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                            <StatusBadge hours={hours || []} manualClosed={shop.status_manual} />

                            <span className="flex items-center gap-1 bg-yellow-900/20 text-yellow-500 px-2 py-1 rounded-full border border-yellow-900/30 backdrop-blur-sm">
                                <Star size={12} fill="currentColor" /> 5.0
                            </span>

                            {(shop.address) && (
                                <span className="hidden md:flex items-center gap-1 text-zinc-400">
                                    <MapPin size={12} /> {shop.address}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <LoginDialog
                isOpen={loginOpen}
                onOpenChange={setLoginOpen}
                onSwitchToRegister={() => {
                    setLoginOpen(false)
                    setRegisterOpen(true)
                }}
            />

            <RegisterDialog
                isOpen={registerOpen}
                onOpenChange={setRegisterOpen}
                onSwitchToLogin={() => {
                    setRegisterOpen(false)
                    setLoginOpen(true)
                }}
                barbershopId={shop.id}
            />
        </header>
    )
}
