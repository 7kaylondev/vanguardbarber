
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TeamManagement } from "@/components/dashboard/team-management"

export default async function EquipePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: shop } = await supabase.from('barbershops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!shop) return <div className="p-8 text-red-500">Barbearia não encontrada.</div>

    // Fetch Professionals
    const { data: professionals } = await supabase.from('professionals')
        .select('*')
        .eq('barbershop_id', shop.id)
        .order('name')

    return (
        <div className="p-8 max-w-6xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Gestão de Equipe</h1>
                <p className="text-gray-400">Gerencie seus profissionais, comissões e atribuições.</p>
            </div>

            <TeamManagement shopId={shop.id} professionals={professionals || []} />
        </div>
    )
}
