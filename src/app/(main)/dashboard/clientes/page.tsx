import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientsKanban } from "@/components/dashboard/clients-kanban"

export default async function ClientsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: shop } = await supabase.from('barbershops').select('id, slug, inactivity_threshold_days, owner_id').eq('owner_id', user.id).single()

    if (!shop) return <div className="p-8 text-white">Carregando loja...</div>



    // Fetch Clients with Appointments for Kanban Classification
    // Join with profiles to get the Single Source of Truth for avatar
    const { data: clients } = await supabase
        .from('clients')
        // FIXED: FETCH ALL APPOINTMENTS WITHOUT STATUS FILTER. 
        // Logic: Classification (New/Recurring) must be derived in memory. 
        // Do NOT filter by status='confirmed' here, otherwise pending/future appointments are invisible.
        .select(`
            id,
            name,
            phone,
            photo_url,
            auth_user_id,
            created_at,
            agendamentos (
                id,
                date,
                time,
                status,
                price,
                products_v2 (name, price)
            )
        `)
        .eq('barbershop_id', shop.id)
        .order('created_at', { ascending: false })



    // KANBAN CLIENT COMPONENT
    return (
        <div className="space-y-6 h-full flex flex-col">


            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#d4af37] font-serif">CRM de Clientes</h1>
                    <p className="text-zinc-500">Gerencie sua base e acompanhe a recorrência.</p>
                </div>
            </div>

            {/* KANBAN CLIENT COMPONENT */}
            <ClientsKanban
                clients={clients || []}
                barbershopId={shop.id}
                shopSlug={shop.slug}
                inactivityThreshold={shop.inactivity_threshold_days || 45}
            />
        </div>
    )
}
