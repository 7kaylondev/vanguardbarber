
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ServicesManager } from "@/components/dashboard/services-manager"

export default async function ServicosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Get Shop ID first
    const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', user.id).single()

    if (!shop) return <div className="p-8 text-red-500">Barbearia não encontrada.</div>

    // STRICT FILTER: Type = 'service'
    const { data: services } = await supabase
        .from('products_v2')
        .select('*')
        .eq('barbershop_id', shop.id)
        .eq('type', 'service')
        .order('name', { ascending: true })

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Catálogo de Serviços</h1>
                <p className="text-gray-400">Gerencie os cortes, barbas e tratamentos oferecidos.</p>
            </div>

            <ServicesManager services={services || []} shopId={shop.id} />
        </div>
    )
}
