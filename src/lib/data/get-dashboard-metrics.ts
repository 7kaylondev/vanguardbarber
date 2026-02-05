import { SupabaseClient } from "@supabase/supabase-js"
import { toZonedTime, format as formatTz } from 'date-fns-tz'
import { format } from "date-fns"

const TIMEZONE = 'America/Sao_Paulo'



interface MetricsFilter {
    shopId: string
    startDate: string // YYYY-MM-DD
    endDate: string   // YYYY-MM-DD
}

export async function getDashboardMetrics(supabase: SupabaseClient, { shopId, startDate, endDate }: MetricsFilter) {
    // 1. Build ISO timestamps with Offset (America/Sao_Paulo)
    // Matches Reports logic: Input YYYY-MM-DD -> Start 00:00:00-0300 / End 23:59:59-0300
    const startIso = `${startDate}T00:00:00-03:00`
    const endIso = `${endDate}T23:59:59-03:00`

    // 2. Fetch REALIZED Appointments (Serviços)
    // Source: agendamentos
    // Filter: status='completed', concluded_at in range
    // Select: need products_v2(price) for fallback if agendamentos.price is null
    const { data: rawApps } = await supabase
        .from('agendamentos')
        .select(`
            id, 
            price, 
            concluded_at,
            created_at,
            status,
            origin,
            service_id,
            products_v2(price)
        `)
        .eq('barbershop_id', shopId)
        .eq('status', 'completed')
        .gte('concluded_at', startIso)
        .lte('concluded_at', endIso)

    // JS Filter (simplified pass-through as we trust DB filter now)
    const inRangeApps = (rawApps || [])

    const realizedApps = inRangeApps

    // 3. Fetch REALIZED Orders (Pedidos)
    // Source: pedidos
    // Filter: status in ['completed', 'delivered'], created_at in range
    const { data: realizedOrders } = await supabase
        .from('pedidos')
        .select('id, total, status, created_at')
        .eq('barbershop_id', shopId)
        .in('status', ['completed', 'delivered'])
        .gte('created_at', startIso)
        .lte('created_at', endIso)

    // 4. Calculate Totals with Fallback Logic (Client-side)
    // Logic: app.price ?? app.products_v2?.price ?? 0
    const calculateAppTotal = (app: any) => {
        return app.price ?? app.products_v2?.price ?? 0
    }

    let servicesTotal = 0
    let productsFromApps = 0;

    (realizedApps || []).forEach(app => {
        const val = calculateAppTotal(app)
        // Classification Logic
        const isQuickSale = app.origin === 'quick_sale'
        const hasNoService = !app.service_id

        if (isQuickSale || hasNoService) {
            productsFromApps += val
        } else {
            servicesTotal += val
        }
    })

    const ordersTotal = (realizedOrders || []).reduce((acc, o) => acc + (o.total || 0), 0)
    const finalProductsTotal = ordersTotal + productsFromApps

    // Total Realized = Services(Completed) + Orders(Completed/Delivered)
    const realizedTotal = servicesTotal + finalProductsTotal

    // Counts
    const appsCount = realizedApps?.length || 0
    const ordersCount = realizedOrders?.length || 0
    const totalTransactions = appsCount + ordersCount

    // Ticket Average
    const avgTicket = totalTransactions > 0 ? realizedTotal / totalTransactions : 0

    return {
        // Requested fields
        realized_total: realizedTotal,       // Total R$ (Realizado)
        services_total: servicesTotal,       // Serviços R$ (Excludes Quick Sales)
        products_total: finalProductsTotal,  // Produtos/Pedidos R$ (Includes Quick Sales + Orders)
        // Update: DashboardPage logic separates appointment_products from service price. 
        // FAILURE POINT: Reports page does NOT seemingly split appointment products from service price for the "Total". It just sums everything.
        // However, current dashboard tries to split. 
        // To match Reports EXACTLY for the "Total" card, we must return the sum logic above.
        // For "Service" vs "Product" distinction in Dashboard, we can refine if needed, but 'realized_total' is the priority.

        sales_count: totalTransactions,
        apps_count: appsCount,
        orders_count: ordersCount,
        average_ticket: avgTicket,

        // Legacy compatibility / Aliases for DashboardPage
        revenueRealized: realizedTotal,
        totalServiceRevenue: servicesTotal,
        totalProductRevenue: finalProductsTotal,
        countRealized: totalTransactions,

        // DEBUG DATA
        _debug: {
            realizedApps,
            realizedOrders
        }
    }
}
