
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProductsManager } from "@/components/dashboard/products-manager"

export default async function BarPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Get Shop ID first
    const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', user.id).single()

    if (!shop) return <div className="p-8 text-red-500">Barbearia não encontrada.</div>

    // Get Products (type = 'product' AND category = 'bar')
    const { data: products } = await supabase
        .from('products_v2')
        .select('*')
        .eq('barbershop_id', shop.id)
        .eq('type', 'product')
        .eq('category', 'bar') // Bar Only
        .order('created_at', { ascending: true })

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Bar & Copa</h1>
                <p className="text-gray-400">Gerencie itens de consumo interno (bebidas, café) que não aparecem na vitrine online.</p>
            </div>

            {/* Reuse Products Manager but we need to tell it to save as 'bar' category */}
            <ProductsManager products={products || []} shopId={shop.id} categoryContext="bar" />
        </div>
    )
}
