
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProductsManager } from "@/components/dashboard/products-manager"

export default async function ProdutosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Get Shop ID first
    const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', user.id).single()

    if (!shop) return <div className="p-8 text-red-500">Barbearia não encontrada.</div>

    // Get Products (type = 'product')
    const { data: products } = await supabase
        .from('products_v2')
        .select('*')
        .eq('barbershop_id', shop.id)
        .eq('type', 'product')
        // Relaxed filter: Show retail OR null (legacy items)
        .or('category.eq.retail,category.is.null')
        .order('created_at', { ascending: true })

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Gestão de Produtos</h1>
                <p className="text-gray-400">Adicione pomadas, óleos e outros itens para venda no balcão ou vitrine.</p>
            </div>

            <ProductsManager products={products || []} shopId={shop.id} />
        </div>
    )
}
