
'use client'

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
// Use specific admin action
import { loginAdmin } from "./actions"
import AuthErrorMessage from "@/app/(auth)/login/auth-error" // Can reuse or make new one
import { ShieldAlert, Terminal } from "lucide-react"

export default function AdminLoginPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#050505] font-mono p-4">
            <Card className="w-full max-w-sm bg-black border border-red-900/40 shadow-[0_0_50px_rgba(127,29,29,0.2)]">
                <CardHeader className="text-center pb-2 space-y-4">
                    <div className="mx-auto h-12 w-12 bg-red-900/10 rounded items-center flex justify-center border border-red-900/30">
                        <Terminal className="text-red-500" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-widest text-red-500 uppercase">
                        Vanguarda HQ
                    </CardTitle>
                    <p className="text-[10px] text-red-800/80 uppercase tracking-[0.2em] font-bold">Restricted Access // Level 5</p>
                </CardHeader>

                <Suspense>
                    <AuthErrorMessage />
                </Suspense>

                <CardContent className="space-y-6 pt-6">
                    <form action={loginAdmin} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="email" className="text-red-900 text-[10px] uppercase">Command ID (Email)</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="bg-[#050505] border-red-900/30 text-red-500 focus:border-red-500 h-10 font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="password" className="text-red-900 text-[10px] uppercase">Access Key (Password)</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-[#050505] border-red-900/30 text-red-500 focus:border-red-500 h-10 font-mono text-sm"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-red-900/20 border border-red-900/50 text-red-500 hover:bg-red-900 hover:text-white font-bold h-10 text-xs tracking-widest uppercase transition-all">
                            Initialize Session
                        </Button>
                    </form>

                    <div className="flex items-center justify-center gap-2 text-[8px] text-red-900/60 uppercase">
                        <ShieldAlert size={10} />
                        <span>Unauthorized attempts will be logged.</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
