
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ShoppingCart } from "lucide-react"
import type { Product } from "@/types/product"
import { cn } from "@/lib/utils"

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Card className="group overflow-hidden border-primary/10 bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
            <CardHeader className="p-0">
                <div className="relative aspect-square w-full overflow-hidden bg-secondary">
                    {product.images_url && product.images_url.length > 0 ? (
                        <Image
                            src={product.images_url[0]}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            Sem Imagem
                        </div>
                    )}
                    <Badge className="absolute right-2 top-2 bg-black/50 text-gold backdrop-blur-sm hover:bg-black/70">
                        {product.category_id}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-1 text-yellow-500">
                    <Star className="fill-current text-yellow-500" size={16} />
                    <span className="text-sm font-medium text-muted-foreground">{product.average_rating || 0}</span>
                </div>
                <h3 className="line-clamp-1 text-lg font-semibold text-primary">{product.name}</h3>
                <p className="mt-2 text-xl font-bold text-foreground">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button className="w-full gap-2 font-semibold">
                    <ShoppingCart size={18} />
                    Adicionar
                </Button>
            </CardFooter>
        </Card>
    )
}
