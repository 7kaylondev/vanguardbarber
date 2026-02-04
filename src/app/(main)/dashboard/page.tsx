
import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { Calendar, Clock } from "lucide-react"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AgendaList } from '@/components/dashboard/agenda-list'
import { NewAppointmentCard } from '@/components/dashboard/new-appointment-card'
import { DateRangeFilter } from '@/components/dashboard/date-range-filter'
import { ViewFutureReportsButton } from "@/components/dashboard/view-future-reports-button"
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'

export const dynamic = 'force-dynamic'

const TIMEZONE = 'America/Sao_Paulo'

export default async function DashboardPage(props: { searchParams: Promise<{ start?: string, end?: string, date?: string }> }) {
    const searchParams = await props.searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Não autorizado</div>

    // Get Shop
    const { data: shop } = await supabase.from('barbershops').select('id, slug').eq('owner_id', user.id).single()

    if (!shop) return <div>Loja não encontrada...</div>

    // --- TIMEZONE ROBUST LOGIC ---
    // 1. Determine "Today" in BRL
    const nowBrl = toZonedTime(new Date(), TIMEZONE)
    const todayStr = format(nowBrl, 'yyyy-MM-dd')

    // 2. Resolve Start/End Strings (YYYY-MM-DD)
    const dateQuery = searchParams.date
    const startDateStr = dateQuery || searchParams.start || todayStr
    const endDateStr = dateQuery || searchParams.end || todayStr

    // 3. Convert to Query ISOs with Offset
    // We treat YYYY-MM-DD as being in Brazil.
    // Start: 2023-XX-XX 00:00:00-03:00
    // End:   2023-XX-XX 23:59:59-03:00
    // This maps correctly to UTC for 'timestamptz' columns.
    const startIso = `${startDateStr}T00:00:00-03:00`
    const endIso = `${endDateStr}T23:59:59-03:00`

    // --- LOGS DE AUDITORIA ---
    console.log(`[DASHBOARD_AUDIT] Visualizando: ${startDateStr} até ${endDateStr} (ISO: ${startIso} -> ${endIso})`)

    // 1. Appointments (Vendas do Período Visualizado)
    // Note: 'date' column is usually YYYY-MM-DD string.
    // If comparing against 'date' column: '2023-10-05' matches '2023-10-05'.
    // If comparing against 'concluded_at' or 'created_at', use startIso/endIso.
    // Dashboard Logic seems to focus on 'Agendamentos' by 'date' (Scheduled Date).
    // If so, simple string comparison is adequate for 'date' column.
    // BUT checking for "Revenue" usually means checking what actually happened?
    // The original code was: .gte('date', startDateStr).lte('date', endDateStr)
    // If 'date' is verified as YYYY-MM-DD DATE column (not timestamp), logic remains: string comparison.
    const { data: periodAppointments } = await supabase
        .from('agendamentos')
        .select(`
            *,
            clients(name, phone),
            professionals(name),
            products_v2(name, price)
        `)
        .eq('barbershop_id', shop.id)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true })
        .order('time', { ascending: true })

    // Stats calculations using ONLY periodAppointments
    let revenue = 0
    let sales = 0
    const confirmedApps = periodAppointments?.filter(a => a.status === 'confirmed' || a.status === 'completed') || []
    sales = confirmedApps.length
    confirmedApps.forEach((app: any) => {
        revenue += (app.price ?? app.products_v2?.price ?? 0)
    })

    // 2. New Clients (Período Visualizado)
    // 'created_at' is timestamptz. MUST use ISO ranges with offset.
    const { count: newClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('barbershop_id', shop.id)
        .gte('created_at', startIso)
        .lte('created_at', endIso)

    // 3. Balance (Vitalício para contexto de caixa, mas estatísticas usam range)
    const { data: allTimeApps } = await supabase
        .from('agendamentos')
        .select(`price, products_v2(price)`)
        .eq('barbershop_id', shop.id)
        .in('status', ['confirmed', 'completed'])

    const balance = allTimeApps?.reduce((acc, app: any) => acc + (app.price ?? app.products_v2?.price ?? 0), 0) || 0

    // 4. Upcoming Appointments (Estritamente Futuro BASEADO NO HOJE REAL BRL)
    // "Upcoming" means > Today (starts Tomorrow).
    // Or > Now? Ideally > Today means future dates.
    const { data: upcomingApps } = await supabase
        .from('agendamentos')
        .select(`id, date, time, status, client_name, products_v2(name)`)
        .eq('barbershop_id', shop.id)
        .gt('date', todayStr) // > 2023-10-XX (Next days) checks date string column
        .neq('status', 'canceled')
        .order('date', { ascending: true })
        .limit(10)

    const events = periodAppointments || []

    // --- UI SYNC ---
    const isSingleDay = startDateStr === endDateStr
    const isToday = isSingleDay && startDateStr === todayStr

    // displayLabel amarra o texto do topo e a query
    // Formatting logic: Parse YYYY-MM-DD as local date for display purpose only
    const formatSafeFull = (s: string) => {
        const [y, m, d] = s.split('-').map(Number)
        return format(new Date(y, m - 1, d), "EEEE, d 'de' MMMM", { locale: ptBR })
    }
    const formatSafeShort = (s: string) => {
        const [y, m, d] = s.split('-').map(Number)
        return format(new Date(y, m - 1, d), 'dd/MM')
    }

    const displayLabel = isSingleDay
        ? formatSafeFull(startDateStr)
        : `${formatSafeShort(startDateStr)} até ${formatSafeShort(endDateStr)}`

    const listTitle = isToday ? "Agenda do Dia" : `Agendamentos: ${displayLabel}`

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-gray-400">
                        {isToday ? "Bem-vindo de volta! Aqui está sua agenda de hoje." : `Visualizando dados de ${displayLabel}.`}
                    </p>
                </div>
                <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
                    <DateRangeFilter />

                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-[#d4af37]/20 rounded-lg text-gray-400 text-sm h-10">
                        <Calendar size={14} className="text-[#d4af37]" />
                        <span className="capitalize text-nowrap">
                            {displayLabel}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <DashboardStats
                balance={balance}
                revenue={revenue}
                sales={sales}
                newClients={newClients || 0}
            />

            {/* TIMELINE SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#d4af37] flex items-center gap-2">
                            <Clock size={20} /> {listTitle} <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded">({events.length})</span>
                        </h2>
                    </div>

                    <div className="bg-[#111] border border-zinc-800 rounded-xl p-6 min-h-[400px]">
                        <AgendaList initialAppointments={events} barbershopSlug={shop.slug} />
                    </div>
                </div>

                {/* Right: Quick Stats or Actions */}
                <div className="space-y-6">
                    <NewAppointmentCard slug={shop.slug} shopId={shop.id} />

                    <div className="bg-[#111] border border-zinc-800 p-6 rounded-xl">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Calendar size={16} className="text-[#d4af37]" />
                            Próximos Dias
                        </h3>
                        <div className="space-y-4">
                            {upcomingApps && upcomingApps.length > 0 ? (
                                upcomingApps.map((app: any) => (
                                    <div key={app.id} className="flex justify-between items-center text-sm border-b border-zinc-800 pb-3 last:border-0 last:pb-0">
                                        <div>
                                            {/* Display Date safely */}
                                            <p className="text-white font-medium">{formatSafeShort(app.date)} - {app.time.substring(0, 5)}</p>
                                            <p className="text-zinc-500 truncate w-32">{app.client_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-1 rounded ${app.status === 'confirmed' ? 'bg-green-900/20 text-green-500' : 'bg-yellow-900/20 text-yellow-500'
                                                }`}>
                                                {app.status === 'confirmed' ? 'Conf.' : 'Pend.'}
                                            </span>
                                            <p className="text-zinc-600 text-[10px] mt-1 truncate w-20">{app.products_v2?.name}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-zinc-500 text-sm italic">Nenhum agendamento futuro.</p>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-zinc-800">
                            <ViewFutureReportsButton />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
