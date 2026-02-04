'use client'

import { Suspense } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { login } from "./actions"
import { Separator } from "@/components/ui/separator"
import AuthErrorMessage from "./auth-error"
import Link from "next/link"
import { ShieldCheck, Lock, Smartphone } from "lucide-react"
import { LeadCaptureDialog } from "@/components/auth/lead-capture-dialog"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#0D0D0D] p-4 relative overflow-hidden">
            {/* Vignette & Ambient Light */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-black/80 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-[100px] pointer-events-none" />

            <Card className="w-full max-w-md bg-[#0A0A0A] border-y border-[#d4af37]/30 border-x-transparent shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10 backdrop-blur-xl">
                {/* Gold Top Accent */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50" />

                <CardHeader className="text-center pb-2 pt-8">
                    <CardTitle className="text-3xl font-bold font-serif tracking-widest text-[#d4af37] drop-shadow-sm">
                        VANGUARD BARBER
                    </CardTitle>
                    <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mt-2">Acesso Exclusivo</p>
                </CardHeader>

                <Suspense fallback={<div className="text-center text-[#d4af37] text-sm animate-pulse">Verificando credenciais...</div>}>
                    <AuthErrorMessage />
                </Suspense>

                <CardContent className="space-y-6 pt-6 px-8">
                    <form action={login} className="space-y-5">
                        <div className="space-y-2 group">
                            <Label htmlFor="email" className="text-gray-400 text-xs uppercase tracking-wider group-focus-within:text-[#d4af37] transition-colors">Email Corporativo</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="seu@email.com"
                                required
                                className="bg-[#111] border-[#333] text-gray-200 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50 transition-all h-12"
                            />
                        </div>
                        <div className="space-y-2 group">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-gray-400 text-xs uppercase tracking-wider group-focus-within:text-[#d4af37] transition-colors">Senha</Label>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-[#111] border-[#333] text-gray-200 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50 transition-all h-12"
                            />
                            <div className="text-right">
                                <Link href="#" className="text-[10px] text-gray-500 hover:text-[#d4af37] transition-colors">
                                    Esqueceu sua credencial?
                                </Link>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-gradient-to-r from-[#d4af37] to-[#B8860B] text-black hover:text-white hover:from-white hover:to-gray-200 font-bold h-12 text-sm tracking-wide shadow-[0_4px_20px_rgba(212,175,55,0.2)] transition-all duration-300">
                            ACESSAR ECOSSISTEMA
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-6 px-8 pb-8">
                    <div className="w-full flex items-center gap-3 opacity-50">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#333]" />
                        <Lock size={12} className="text-[#d4af37]" />
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#333]" />
                    </div>

                    <div className="text-center space-y-3">
                        <p className="text-xs text-gray-500">
                            Não possui uma licença?
                        </p>
                        <LeadCaptureDialog />
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[10px] text-gray-600 bg-[#050505] py-2 px-4 rounded-full border border-[#333]/50">
                        <ShieldCheck size={10} className="text-green-900" />
                        <span>Acesso criptografado via Supabase RLS. Blindagem de dados ativa.</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
