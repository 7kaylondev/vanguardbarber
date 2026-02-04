
'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { updateProductField, deleteProduct } from "@/app/actions/product"
import { Trash2, AlertTriangle } from "lucide-react" // Added AlertTriangle
import { Button } from "@/components/ui/button"
import { useState } from "react" // Added useState
import type { Product } from "@/types/product"

interface InventoryTableProps {
    products: Product[]
}

export function InventoryTable({ products }: InventoryTableProps) {
    return (
        <div className="rounded-md border border-primary/20 bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-primary/5">
                        <TableHead className="text-primary">Produto</TableHead>
                        <TableHead className="text-primary">Categoria</TableHead>
                        <TableHead className="text-primary">Preço (R$)</TableHead>
                        <TableHead className="text-primary">Estoque</TableHead>
                        <TableHead className="text-right text-primary">Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <InventoryRow key={product.id} product={product} />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function InventoryRow({ product }: { product: Product }) {
    const [price, setPrice] = useState(product.price)
    const [stock, setStock] = useState(product.stock_quantity)
    const [loading, setLoading] = useState(false)
    // const { toast } = useToast()

    const handlePriceChange = async (newPrice: string) => {
        const val = parseFloat(newPrice)
        if (isNaN(val)) return
        setPrice(val)
        // Debounce or blur could trigger save. For "Instant" feel, we might want blur.
    }

    const savePrice = async () => {
        try {
            setLoading(true)
            await updateProductField(product.id, 'price', price)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleStockChange = async (newStock: string) => {
        const val = parseInt(newStock)
        if (isNaN(val)) return
        setStock(val)
    }

    const saveStock = async () => {
        try {
            setLoading(true)
            await updateProductField(product.id, 'stock_quantity', stock)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return
        try {
            setLoading(true)
            await deleteProduct(product.id)
        } catch (e) {
            alert('Erro ao excluir')
        }
    }

    return (
        <TableRow className="hover:bg-primary/5">
            <TableCell className="font-medium text-foreground">{product.name}</TableCell>
            <TableCell className="text-muted-foreground">{product.category_id}</TableCell>
            <TableCell>
                <Input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    onBlur={savePrice}
                    className="w-24 bg-transparent border-transparent hover:border-primary/50 focus:border-primary text-foreground"
                />
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        value={stock}
                        onChange={(e) => handleStockChange(e.target.value)}
                        onBlur={saveStock}
                        className="w-20 bg-transparent border-transparent hover:border-primary/50 focus:border-primary text-foreground"
                    />
                    {stock < 5 && (
                        <AlertTriangle className="h-4 w-4 text-primary animate-pulse" />
                    )}
                </div>
            </TableCell>
            <TableCell className="text-right">
                <Badge variant={stock > 0 ? "outline" : "destructive"} className="border-primary/50 text-primary">
                    {stock > 0 ? "Em Estoque" : "Esgotado"}
                </Badge>
            </TableCell>
            <TableCell>
                <Button variant="ghost" size="icon" className="hover:text-red-500 hover:bg-red-500/10" onClick={handleDelete} disabled={loading}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    )
}
