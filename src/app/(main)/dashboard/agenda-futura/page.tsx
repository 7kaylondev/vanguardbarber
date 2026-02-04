import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AgendaList } from "@/components/dashboard/agenda-list"
import { format } from "date-fns"

export const dynamic = 'force-dynamic'

export default async function FutureAgendaPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: shop } = await supabase.from('barbershops').select('id, slug').eq('owner_id', user.id).single()

    if (!shop) return <div>Loja não encontrada...</div>

    // Fetch ALL future appointments (tomorrow onwards)
    const today = format(new Date(), 'yyyy-MM-dd')

    const { data: appointments } = await supabase
        .from('agendamentos')
        .select(`
            *,
            clients(name),
            products_v2(name, price),
            professionals(name)
        `)
        .eq('barbershop_id', shop.id)
        .gt('date', today)
        .neq('status', 'canceled') // Optional: maybe show canceled? User said "Actions: Confirm, Cancel, Complete". Usually future includes active ones.
        .order('date', { ascending: true })
        .order('time', { ascending: true })

    // Map to Appointment interface expected by AgendaList
    // Note: AgendaList expects "client_name" and "client_phone". 
    // If these are null in DB (e.g. from CRM), we fallback to clients table.
    const mappedAppointments = appointments?.map(app => ({
        ...app,
        client_name: app.clients?.name || app.client_name || 'Cliente sem nome',
        client_phone: app.client_phone || '', // Check if we need to fetch phone from profile if missing
    })) || []

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Agenda Futura</h1>
                <p className="text-gray-400">Próximos atendimentos a partir de amanhã.</p>
            </div>

            <div className="bg-[#111] border border-zinc-800 rounded-xl p-6 min-h-[500px]">
                <AgendaList
                    initialAppointments={mappedAppointments}
                    barbershopSlug={shop.slug}
                />
            </div>
        </div>
    )
}
