
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ShopSettingsForm } from "@/components/dashboard/shop-settings-form"

export default async function PosicionamentoPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: shop } = await supabase
        .from('barbershops')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Posicionamento</h1>
                <p className="text-gray-400">Personalize a identidade visual da sua vitrine digital.</p>
            </div>

            {shop ? (
                <ShopSettingsForm shop={shop} />
            ) : (
                <div className="p-4 bg-red-900/20 text-red-400 rounded border border-red-900/50">
                    Erro: Nenhuma barbearia vinculada a esta conta.
                </div>
            )}
        </div>
    )
}
