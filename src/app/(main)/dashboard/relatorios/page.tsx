import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, Printer } from "lucide-react"
import React from "react"
import { DynamicDateRangeFilter } from "@/components/dashboard/dynamic-date-range-filter"
import { ReportStatusCell } from "@/components/dashboard/report-status-cell"
import { PrintButton } from "./print-button"
import { QuickReportSummary } from "./quick-report-summary" // NEW IMPORT
import { PrintReceiptButton } from "@/components/dashboard/print-receipt-button"
import "./thermal.css"
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'
import { getCurrentShopId } from "@/lib/tenant/get-current-shop-id.server"
import { ShopSelector } from "@/components/tenant/shop-selector"

export const dynamic = 'force-dynamic'

const TIMEZONE = 'America/Sao_Paulo'

export default async function ReportsPage(props: { searchParams: Promise<{ start?: string, end?: string }> }) {
    const searchParams = await props.searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const cookieStore = await cookies()
    const currentShopCookie = cookieStore.get('current_shop_id')?.value || 'MISSING'

    if (!user) redirect('/login')

    // --- STRICT TENANT SELECTION ---
    const currentShopId = await getCurrentShopId(supabase)

    if (!currentShopId) {
        const { data: userShops } = await supabase
            .from('barbershops')
            .select('id, name, slug')
            .eq('owner_id', user.id)

        if (!userShops || userShops.length === 0) {
            return <div>Você ainda não possui nenhuma barbearia.</div>
        }
        return <ShopSelector shops={userShops} userId={user.id} />
    }

    const { data: shop } = await supabase
        .from('barbershops')
        .select('*')
        .eq('id', currentShopId)
        .single()

    if (!shop) return <div>Loja não encontrada...</div>

    // --- TIMEZONE ROBUST LOGIC ---
    const nowBrl = toZonedTime(new Date(), TIMEZONE)
    const todayStr = format(nowBrl, 'yyyy-MM-dd')

    // Helper: Input is YYYY-MM-DD. We assume this is "Day X in Brazil".
    // We want to query UTC range that covers 00:00:00 to 23:59:59 BRL.
    const getUtcRange = (dateStr: string) => {
        // Construct "YYYY-MM-DDT00:00:00" treating strictly as literal BRL time
        // Then get the UTC equivalent.
        // Example: 2023-10-05
        // Start: 2023-10-05T00:00:00 BRL -> 2023-10-05T03:00:00 Z (approx)
        // End: 2023-10-05T23:59:59 BRL -> 2023-10-06T02:59:59 Z (approx)

        // Note: Using a simple string concat can be tricky with DST.
        // Robust way: Parse literal info into a Date object, force it to be "zoned".

        const [y, m, d] = dateStr.split('-').map(Number)
        // Create date object reflecting that local time
        // Note: new Date(y, m-1, d) creates it in SERVER local time.
        // We want to say "This specific YMD components belong to TIMEZONE".

        // Let's use string construction with offset if possible? No, offsets change.
        // Simplest strategy:
        // 1. Create string ISO-like "YYYY-MM-DDTHH:mm:ss"
        // 2. Use fromZonedTime(string, TIMEZONE) -> Returns UTC Date

        // Important: fromZonedTime needs a clear string without 'Z' or offset if we say it's in TIMEZONE.
        // But date-fns-tz 'fromZonedTime' (v2/v3 might differ, checking standard usage).
        // Actually simplest is constructing string and letting library handle.

        const startLocalStr = `${dateStr} 00:00:00`
        const endLocalStr = `${dateStr} 23:59:59.999`

        // These helpers assume the string is in TIMEZONE, gives back UTC Date
        // Since we are server side, we must be careful.
        // For simplicity in this environment:
        // We will do a manual offset calculation if needed, OR trust date-fns-tz fully if setup.

        // Actually, we can just use the provided ISO string if we construct it carefully.
        // Let's assume standard offset -03:00 for simplicity OR use the library.
        // Using library:
        // const utcStart = fromZonedTime(startLocalStr, TIMEZONE) <-- This function was renamed/changed in v4?
        // Let's stick to string manipulation if we want to be 100% sure without complex dep issues,
        // BUT user asked for date-fns-tz.

        // Let's try native Date with some math if library is finicky, but let's try the simple offset approach first.
        // Actually, easiest way is just string concat with offset if we assume -03:00.
        // But let's do it properly.

        // Correct way with date-fns-tz v4 (common):
        // const d = new Date('2023-10-01T00:00:00') // server local
        // We really want to parse as "Brazil Time".

        // Let's rely on string formatting that Supabase accepts.
        // Supabase accepts ISO strings.
        // 00:00 BRL is 03:00 UTC.
        // So for '2023-10-05', we want '2023-10-05T03:00:00Z'.

        // Manual offset for now is safest without risking runtime import errors if API changed.
        // But I installed date-fns-tz. I will use formatInTimeZone to get the UTC string.
        return {
            start: `${dateStr}T03:00:00Z`, // Simplified approx for -03:00
            end: `${dateStr}T23:59:59.999-03:00` // Better: Send with offset
        }
        // Wait, better yet: Send the OFFSET string to postgres. Postgres understands '2023-10-05 00:00:00-03'.
        // This is perfectly valid TIMESTAMPTZ input.
        // THIS IS THE CLEANEST SOLUTION.
    }

    const startDate = searchParams.start || todayStr
    const endDate = searchParams.end || todayStr

    // FIX: Send explicit offset to Supabase
    // >= 'YYYY-MM-DDT00:00:00-03:00'
    // <= 'YYYY-MM-DDT23:59:59-03:00'
    const startIso = `${startDate}T00:00:00-03:00`
    const endIso = `${endDate}T23:59:59-03:00`

    console.log(`[REPORTS_AUDIT_FIX] Range: ${startDate} to ${endDate} (ISO: ${startIso} -> ${endIso})`)

    // 2. Fetch REALIZED
    const { data: realizedApps } = await supabase
        .from('agendamentos')
        .select(`*, clients(name), products_v2(name, price, category)`)
        .eq('barbershop_id', shop.id)
        .eq('status', 'completed')
        .gte('concluded_at', startIso)
        .lte('concluded_at', endIso)

    // --- MANUAL JOIN: Appointment Items (Report Detail) ---
    const realizedIds = realizedApps?.map(a => a.id) || []
    let manualItems: any[] = []

    if (realizedIds.length > 0) {
        const { data: items } = await supabase
            .from('appointment_products')
            .select('*')
            .in('appointment_id', realizedIds)
        manualItems = items || []
    }

    // Merge Items
    const realizedWithItems = realizedApps?.map(app => ({
        ...app,
        appointment_products: manualItems.filter(i => i.appointment_id === app.id)
    })) || []



    // For Projected, we usually don't have items yet (or we do if Quick Sale added them?)
    // Let's assume projected usually doesn't need detailed item breakdown for "Revenue", 
    // BUT if we want consistency, we should do it. User focused on "Consumption breakdown", usually for closed sales.
    // Let's stick to Realized for the detailed report for now, but apply same logic if needed.
    // Actually, Quick Sale creates COMPLETED appointments immediately (realized).
    // So modifying 'realizedApps' is key.

    // 3. Fetch PROJECTED
    // Note: 'date' column in 'agendamentos' is usually just 'YYYY-MM-DD'.
    // Comparing date string '2023-10-05' matches exactly.
    // If 'date' is string only, we just use the strings.
    // If 'date' is timestamp, we use the ISOs.
    // Based on previous code: .gte('date', startDate) -> implies it might be string or date.
    // If it's a 'date' type column in PG, just passing the YYYY-MM-DD string is correct.
    const { data: projectedApps } = await supabase
        .from('agendamentos')
        .select(`*, clients(name), products_v2(name, price, category)`)
        .eq('barbershop_id', shop.id)
        .in('status', ['confirmed', 'pending'])
        .gte('date', startDate)
        .lte('date', endDate)

    // 4. Fetch Orders
    const { data: realizedOrders } = await supabase
        .from('pedidos')
        .select('*')
        .eq('barbershop_id', shop.id)
        .in('status', ['completed', 'delivered'])
        .gte('created_at', startIso)
        .lte('created_at', endIso)

    const { data: projectedOrders } = await supabase
        .from('pedidos')
        .select('*')
        .eq('barbershop_id', shop.id)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
        .gte('created_at', startIso)
        .lte('created_at', endIso)

    // 5. Calculations
    const appsRealizedVal = realizedApps?.reduce((acc, app) => acc + (app.price ?? app.products_v2?.price ?? 0), 0) || 0
    const appsProjectedVal = projectedApps?.reduce((acc, app) => acc + (app.price ?? app.products_v2?.price ?? 0), 0) || 0

    const ordersRealizedVal = realizedOrders?.reduce((acc, o) => acc + (o.total || 0), 0) || 0
    const ordersProjectedVal = projectedOrders?.reduce((acc, o) => acc + (o.total || 0), 0) || 0

    const realizedRevenue = appsRealizedVal + ordersRealizedVal
    const projectedRevenue = appsProjectedVal + ordersProjectedVal
    const totalRevenue = realizedRevenue + projectedRevenue

    const totalApps = (realizedApps?.length || 0) + (projectedApps?.length || 0)
    const totalOrders = (realizedOrders?.length || 0) + (projectedOrders?.length || 0)
    const totalTransactions = totalApps + totalOrders

    const ticketMedia = totalTransactions > 0 ? totalRevenue / totalTransactions : 0


    // UI Date Formatting
    // Helper to format a potentially UTC string into BRL display "dd/MM"
    const displayDateRef = (isoStringOrDate: string | Date | null) => {
        if (!isoStringOrDate) return '-'
        const date = typeof isoStringOrDate === 'string' ? new Date(isoStringOrDate) : isoStringOrDate
        return formatInTimeZone(date, TIMEZONE, 'dd/MM')
    }

    const displayTimeRef = (isoStringOrDate: string | Date | null) => {
        if (!isoStringOrDate) return '-'
        const date = typeof isoStringOrDate === 'string' ? new Date(isoStringOrDate) : isoStringOrDate
        return formatInTimeZone(date, TIMEZONE, 'HH:mm')
    }

    // Header Display
    // Using string parts is safe because startDate/endDate are YYYY-MM-DD
    const formatSafe = (dateStr: string) => {
        const [y, m, d] = dateStr.split('-').map(Number)
        // Creating local date just for formatting day/month text is safe if we don't converting back to UTC
        return format(new Date(y, m - 1, d), "dd/MM")
    }
    const formatFullSafe = (dateStr: string) => {
        const [y, m, d] = dateStr.split('-').map(Number)
        return format(new Date(y, m - 1, d), "EEEE, d 'de' MMMM", { locale: ptBR })
    }

    const formattedDate = (startDate === endDate)
        ? formatFullSafe(startDate)
        : `${formatSafe(startDate)} até ${formatSafe(endDate)}`

    // Unified List
    // Use realizedWithItems instead of realizedApps for completed ones
    const allApps = [...(realizedWithItems || []), ...(projectedApps || [])]
    const allOrders = [...(realizedOrders || []), ...(projectedOrders || [])]

    // --- QUICK SUMMARY METRICS ---
    let totalServiceRev = 0
    let totalProductRev = 0

    allApps.forEach(app => {
        const mainPrice = app.products_v2?.price || 0
        const cat = app.products_v2?.category?.toLowerCase() || ''
        const isProductMain = cat.includes('produto') || cat.includes('bebida') || cat.includes('bar') || app.origin === 'quick_sale'

        if (isProductMain) {
            totalProductRev += mainPrice
        } else {
            totalServiceRev += mainPrice
        }

        if (app.appointment_products) {
            app.appointment_products.forEach((i: any) => {
                totalProductRev += (i.price * i.quantity)
            })
        }
    })

    const reportData = {
        totalService: totalServiceRev,
        totalProduct: totalProductRev,
        totalApps: allApps.length,
        ticketAvg: ticketMedia
    }

    const unifiedList = [
        ...allApps.map(a => {
            // Movement date logic:
            // If completed -> use concluded_at (TimestampTZ) -> Format in Timezone
            // If pending/confirmed -> use date (YYYY-MM-DD) + time (HH:mm) strings -> Construct Local -> Display
            let dateObj: Date
            let isTimestamp = false

            if (a.status === 'completed' && a.concluded_at) {
                dateObj = new Date(a.concluded_at)
                isTimestamp = true
            } else {
                // Construct date from YYYY-MM-DD and HH:mm assuming they mean BRL time
                // toZonedTime helper can take specific string?
                // Actually, for sorting, we need a comparable value.
                // "2023-10-05" + "14:00" -> 2023-10-05T14:00:00-03:00
                const isoStr = `${a.date}T${a.time}:00-03:00`
                dateObj = new Date(isoStr)
                isTimestamp = false
            }

            const displayD = isTimestamp
                ? displayDateRef(dateObj)
                : formatSafe(a.date) // It's just date string, safe usage

            const displayT = isTimestamp
                ? displayTimeRef(dateObj)
                : a.time.substring(0, 5)

            return {
                id: a.id,
                type: 'appointment',
                dateObj: dateObj, // For sorting
                displayDateTime: `${displayD} ${displayT}`,
                client: a.clients?.name || a.client_name || 'Cliente',
                item: a.products_v2?.name || 'Serviço',
                status: a.status,
                value: a.price ?? a.products_v2?.price ?? 0,
                // Custom Label Logic
                label: (() => {
                    if (a.origin === 'quick_sale' && !a.service_id) return 'Consumo' // Assumption: Quick Sale is mostly Consumo/Product
                    const cat = a.products_v2?.category?.toLowerCase() || ''
                    if (cat.includes('bar') || cat.includes('bebida') || cat.includes('consumo')) return 'Consumo'
                    if (cat.includes('produto') || a.products_v2?.type === 'product') return 'Produto'
                    return 'Serviço'
                })()
            }
        }),
        ...allOrders.map(o => {
            const dateObj = new Date(o.created_at) // created_at is timestamptz
            return {
                id: o.id,
                type: 'order',
                dateObj: dateObj,
                displayDateTime: `${displayDateRef(dateObj)} ${displayTimeRef(dateObj)}`,
                client: o.client_name || 'Cliente',
                item: `Pedido (${o.items?.length || 1} itens)`,
                status: o.status,
                value: o.total,
                label: 'Produtos' // Orders are always products? Actually "Pedido" usually implies products.
            }
        })
    ].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())


    return (
        <div className="space-y-6 pb-10">
            {/* Screen UI */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Relatórios</h1>
                    <p className="text-gray-400">
                        {startDate === endDate
                            ? `Agendamentos: ${formattedDate}`
                            : `Resumo de ${formattedDate}`}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <DynamicDateRangeFilter />
                    <QuickReportSummary reportData={reportData} />
                    <PrintButton />
                </div>
            </div>

            {/* Screen Table */}
            <div className="bg-[#111] border border-zinc-800 rounded-xl p-6 overflow-hidden no-print">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-zinc-900 p-4 rounded border border-zinc-800 relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-4 opacity-10">
                            <CalendarIcon className="w-16 h-16 text-blue-500" />
                        </div>
                        <span className="text-zinc-500 text-xs uppercase font-bold block mb-1">Realizado</span>
                        <div className="text-2xl font-bold text-blue-500">R$ {realizedRevenue.toFixed(2)}</div>
                        <span className="text-xs text-zinc-600">{realizedApps?.length || 0} apps + {realizedOrders?.length || 0} pedidos</span>
                    </div>

                    <div className="bg-zinc-900 p-4 rounded border border-zinc-800 relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-4 opacity-10">
                            <CalendarIcon className="w-16 h-16 text-[#d4af37]" />
                        </div>
                        <span className="text-zinc-500 text-xs uppercase font-bold block mb-1">Projetado (Futuro)</span>
                        <div className="text-2xl font-bold text-[#d4af37]">R$ {projectedRevenue.toFixed(2)}</div>
                        <span className="text-xs text-zinc-600">{projectedApps?.length || 0} apps + {projectedOrders?.length || 0} pedidos</span>
                    </div>

                    <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
                        <span className="text-zinc-500 text-xs uppercase font-bold block mb-1">Total (Previsto)</span>
                        <div className="text-2xl font-bold text-white">R$ {totalRevenue.toFixed(2)}</div>
                    </div>

                    <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
                        <span className="text-zinc-500 text-xs uppercase font-bold block mb-1">Ticket Médio</span>
                        <div className="text-2xl font-bold text-zinc-300">R$ {ticketMedia.toFixed(2)}</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-zinc-400">
                        <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500">
                            <tr>
                                <th className="px-4 py-3">Tipo</th>
                                <th className="px-4 py-3">Data/Hora</th>
                                <th className="px-4 py-3">Cliente</th>
                                <th className="px-4 py-3 hidden md:table-cell">Detalhe</th>
                                <th className="px-4 py-3 hidden md:table-cell">Status</th>
                                <th className="px-4 py-3 text-right">Valor</th>
                                <th className="px-4 py-3 text-right w-[50px] hidden md:table-cell">Imp.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {unifiedList.map((item) => (
                                <tr key={item.id} className="hover:bg-zinc-900/50">
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${['Consumo', 'Produto'].includes(item.label) ? 'bg-orange-900/20 text-orange-500' : 'bg-purple-900/20 text-purple-500'
                                            }`}>
                                            {item.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-zinc-300">
                                        {item.displayDateTime}
                                    </td>
                                    <td className="px-4 py-3 text-white">{item.client}</td>
                                    <td className="px-4 py-3 hidden md:table-cell">{item.item}</td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <ReportStatusCell
                                            id={item.id}
                                            type={item.type as 'appointment' | 'order'}
                                            currentStatus={item.status}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right text-green-500">R$ {item.value.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right hidden md:table-cell">
                                        <PrintReceiptButton
                                            shopName={shop.name}
                                            transaction={{
                                                id: item.id,
                                                type: item.type,
                                                displayDateTime: item.displayDateTime,
                                                client: item.client,
                                                item: item.item,
                                                value: item.value
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                            {unifiedList.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-600">Nenhum registro no período.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PRINT TEMPLATE (Hidden on Screen) */}
            <div className="print-container">
                <h1>{shop.name}</h1>
                <p className="text-center">{formattedDate}</p>
                <div className="border-b my-2"></div>

                <p className="text-center font-bold">RESUMO DIÁRIO</p>
                <div className="flex justify-between mt-2">
                    <span>Atendimentos:</span>
                    <span>{totalApps}</span>
                </div>
                <div className="flex justify-between">
                    <span>Total Bruto:</span>
                    <span>R$ {totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Ticket Médio:</span>
                    <span>R$ {ticketMedia.toFixed(2)}</span>
                </div>

                <div className="border-b my-2"></div>

                <table>
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>Cli.</th>
                            <th className="text-right">R$</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allApps.map((app) => {
                            // Logic to show Service + Items
                            const items = app.appointment_products || []
                            const servicePrice = app.products_v2?.price || 0
                            const hasItems = items.length > 0

                            return (
                                <React.Fragment key={app.id}>
                                    <tr key={app.id}>
                                        <td>{app.time.substring(0, 5)}</td>
                                        <td>{app.clients?.name?.substring(0, 10)}</td>
                                        {/* Main Service Price */}
                                        <td className="text-right">{servicePrice > 0 ? servicePrice.toFixed(2) : '-'}</td>
                                    </tr>
                                    {/* Render Items Rows */}
                                    {hasItems && items.map((i: any, idx: number) => (
                                        <tr key={`${app.id}-item-${idx}`} className="text-[10px] text-gray-500">
                                            <td></td>
                                            <td className="pl-2">+ {i.name.substring(0, 12)}</td>
                                            <td className="text-right">{(i.price * i.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {/* Subtotal if items exist */}
                                    {hasItems && (
                                        <tr className="font-bold border-b border-dashed">
                                            <td></td>
                                            <td className="text-right text-[10px]">Total:</td>
                                            <td className="text-right">{app.price?.toFixed(2)}</td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </tbody>
                </table>

                <div className="border-t mt-4 pt-2 text-center text-xs">
                    <p>Gerado por Vanguarda</p>
                    <p>{formatInTimeZone(new Date(), TIMEZONE, 'dd/MM/yyyy HH:mm')}</p>
                </div>
            </div>
        </div >
    )
}
