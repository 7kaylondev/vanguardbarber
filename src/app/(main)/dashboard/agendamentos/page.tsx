
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock, Filter, Search, Calendar } from "lucide-react"
import { DynamicDateRangeFilter } from "@/components/dashboard/dynamic-date-range-filter"
import { Badge } from "@/components/ui/badge"
import { toZonedTime, format as formatTz } from 'date-fns-tz'
import { Card, CardContent } from "@/components/ui/card"
import { AppointmentsClient } from "@/components/dashboard/appointments-client"
import { NewAppointmentCard } from "@/components/dashboard/new-appointment-card"

export const dynamic = 'force-dynamic'

const TIMEZONE = 'America/Sao_Paulo'

export default async function AppointmentsPage(props: { searchParams: Promise<{ start?: string, end?: string }> }) {
    const searchParams = await props.searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: shop } = await supabase.from('barbershops').select('id, name, slug').eq('owner_id', user.id).single()

    if (!shop) return <div>Loja não encontrada...</div>

    // --- TIMEZONE & DATES ---
    const nowBrl = toZonedTime(new Date(), TIMEZONE)
    const todayStr = formatTz(nowBrl, 'yyyy-MM-dd', { timeZone: TIMEZONE })

    const startDate = searchParams.start || todayStr
    const endDate = searchParams.end || todayStr

    // Safe Query mirroring Dashboard Page
    // Using '*' to ensure all keys required for relations are present (PGRST200 Fix)
    // Safe Query mirroring Dashboard Page
    // REMOVED 'appointment_products' relation from join because of persistent Schema Cache error 'PGRST200'
    // We will fetch items manually below (Manual Join).
    const { data: rawList, error: queryError } = await supabase
        .from('agendamentos')
        .select(`
            *,
            clients ( name, phone ),
            professionals ( name ),
            products_v2 ( name, price )
        `)
        .eq('barbershop_id', shop.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .order('time', { ascending: false })

    if (queryError) {
        console.error("[AppointmentsPage] Error:", JSON.stringify(queryError, null, 2))
        return <div>Erro ao carregar agendamentos: {queryError.message}</div>
    }

    // --- MANUAL JOIN: Appointment Items ---
    const appIds = rawList?.map(a => a.id) || []
    let manualItems: any[] = []

    if (appIds.length > 0) {
        const { data: items } = await supabase
            .from('appointment_products')
            .select('*')
            .in('appointment_id', appIds)
        manualItems = items || []
    }

    // Merge Check
    const list = rawList?.map(app => {
        const myItems = manualItems.filter(i => i.appointment_id === app.id)
        return {
            ...app,
            appointment_products: myItems
        }
    })

    // --- FORMAT UTILS ---
    const formatBrlDate = (d: string) => {
        const [y, m, dDay] = d.split('-').map(Number)
        return format(new Date(y, m - 1, dDay), 'dd/MM/yyyy')
    }

    const totalApps = list?.length || 0
    const totalValue = list?.reduce((acc, app) => acc + (app.price || 0), 0) || 0

    return (
        <div className="space-y-6 pb-20 md:pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Calendar className="text-[#d4af37]" />
                        Histórico de Agendamentos
                    </h1>
                    <p className="text-gray-400">
                        {startDate === endDate
                            ? `Visualizando dia ${formatBrlDate(startDate)}`
                            : `Período de ${formatBrlDate(startDate)} até ${formatBrlDate(endDate)}`
                        }
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 bg-[#111] p-1.5 rounded-lg border border-zinc-800">
                    <DynamicDateRangeFilter />
                </div>
            </div>

            {/* Quick Stats - DESKTOP ONLY */}
            <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-[#111] border-zinc-800">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-zinc-900 p-3 rounded-full text-[#d4af37]">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-bold uppercase">Total</p>
                            <p className="text-xl font-bold text-white">{totalApps}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-[#111] border-zinc-800">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-zinc-900 p-3 rounded-full text-green-500">
                            <span className="font-bold text-lg">R$</span>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-bold uppercase">Valor Estimado</p>
                            <p className="text-xl font-bold text-green-500">R$ {totalValue.toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* QUICK ACTIONS: New Appointment & Quick Sale */}
            <div className="md:hidden">
                <NewAppointmentCard slug={shop.slug} shopId={shop.id} hideQuickSale={true} />
            </div>

            {/* DESKTOP HEADER ACTIONS */}
            <div className="hidden md:block">
                <NewAppointmentCard slug={shop.slug} shopId={shop.id} hideQuickSale={true} />
            </div>

            {/* CLIENT LIST (Mobile Cards + Desktop Table) */}
            <AppointmentsClient
                initialAppointments={list || []}
                shopSlug={shop.slug}
                shopId={shop.id}
            />
        </div>
    )
}

