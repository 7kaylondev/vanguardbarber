
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/products/product-card'
import { ProductFilters } from '@/components/products/product-filters'
import { Separator } from '@/components/ui/separator'
import type { Product } from '@/types/product'

interface ProductsPageProps {
    searchParams: Promise<{ search?: string; category?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const supabase = await createClient()
    const params = await searchParams
    const searchTerm = params.search || ''

    let query = supabase.from('products').select('*')

    if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
    }

    const { data: products, error } = await query

    if (error) {
        console.error('Error fetching products:', error)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-8 md:flex-row">
                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 flex-none space-y-8">
                    <div>
                        <h2 className="text-xl font-bold text-primary mb-4">Filtrar</h2>
                        <ProductFilters />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-foreground">Nossos Produtos</h1>
                        <p className="text-muted-foreground">Encontre o melhor para o seu estilo.</p>
                    </div>
                    <Separator className="my-6 bg-primary/20" />

                    {products && products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product as Product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-primary/20 bg-card/50">
                            <p className="text-lg font-medium text-muted-foreground">Nenhum produto encontrado.</p>
                            {searchTerm && <p className="text-sm text-muted-foreground">Tente buscar por outro termo.</p>}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
