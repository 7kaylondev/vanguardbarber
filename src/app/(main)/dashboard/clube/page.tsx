
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClubManager } from "@/components/dashboard/club-manager"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function ClubePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Get Shop
    const { data: shop } = await supabase.from('barbershops')
        .select('id, modulo_clube_ativo')
        .eq('owner_id', user.id)
        .single()

    if (!shop) return <div className="p-8 text-red-500">Barbearia não encontrada.</div>

    // Get Club Plans (Products with type='club')
    const { data: plans } = await supabase
        .from('products_v2')
        .select('*')
        .eq('barbershop_id', shop.id)
        .eq('type', 'club')
        .order('price', { ascending: true })

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Clube de Assinaturas</h1>
                <p className="text-gray-400">Gerencie os planos e benefícios do seu clube de fidelidade.</p>
            </div>

            {/* Warning if Module Disabled */}
            {!shop.modulo_clube_ativo && (
                <Card className="bg-yellow-900/10 border-yellow-900/50 mb-6">
                    <CardContent className="flex items-center gap-4 p-4 text-yellow-500">
                        <AlertCircle />
                        <div>
                            <p className="font-bold">O Módulo Clube está desativado na Vitrine.</p>
                            <p className="text-sm opacity-80">
                                Seus clientes não verão essa seção. Ative em <Link href="/dashboard/configuracoes" className="underline hover:text-yellow-400">Configurações</Link>.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <ClubManager plans={plans || []} shopId={shop.id} />
        </div>
    )
}
