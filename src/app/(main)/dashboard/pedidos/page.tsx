
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ShoppingBag, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OrdersList } from "@/components/dashboard/orders-list"

export default async function OrdersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: shop } = await supabase.from('barbershops').select('id, slug').eq('owner_id', user.id).single()

    if (!shop) return <div>Loja não encontrada...</div>

    // Fetch Orders - Pending + Confirmed first
    // Ideally user wants to see Active orders. 
    // We can fetch all and filter in client or fetch recent.
    // Let's fetch recent 50.
    const { data: orders } = await supabase
        .from('pedidos')
        .select('*')
        .eq('barbershop_id', shop.id)
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <ShoppingBag className="text-[#d4af37]" />
                        Pedidos
                    </h1>
                    <p className="text-gray-400">Gerencie vendas de produtos e entregas.</p>
                </div>
                {/* <Button variant="secondary">Novo Pedido</Button> */}
            </div>

            <div className="bg-[#111] border border-zinc-800 rounded-xl p-6 min-h-[500px]">
                <OrdersList initialOrders={orders || []} />
            </div>
        </div>
    )
}
