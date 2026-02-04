
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UnifiedConfigForm } from "@/components/dashboard/unified-config-form"

export default async function ConfiguracoesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Get Shop ID and Config Data
    const { data: shop } = await supabase.from('barbershops')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    if (!shop) return <div className="p-8 text-red-500">Barbearia não encontrada.</div>

    // Get Existing Hours
    const { data: hours } = await supabase
        .from('horarios_config')
        .select('*')
        .eq('barbershop_id', shop.id)
        .order('day_of_week', { ascending: true })

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
                <p className="text-gray-400">Gerencie todas as preferências da sua loja em um só lugar.</p>
            </div>

            <UnifiedConfigForm shop={shop} initialHours={hours || []} />
        </div>
    )
}
