
'use client'

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Package, Pencil } from "lucide-react"
import { toast } from "sonner"
import { deleteProduct } from "@/app/(main)/dashboard/actions"
import { ProductFormDialog } from "./product-form-dialog"

// NEW: categoryContext to know if we are in Bar or Retail page
export function ProductsManager({ products, shopId, categoryContext = 'retail' }: { products: any[], shopId: string, categoryContext?: 'retail' | 'bar' }) {

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja remover este produto?")) return
        const res = await deleteProduct(id)
        if (res?.error) toast.error(res.error)
        else toast.success("Produto removido.")
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#111] p-4 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-4 text-purple-500 bg-purple-900/10 px-4 py-2 rounded border border-purple-900/30">
                    <Package size={20} />
                    <span className="font-mono text-sm">{products.length} Produtos Cadastrados</span>
                </div>

                <ProductFormDialog shopId={shopId} type="product" category={categoryContext} />
            </div>

            <div className="border border-zinc-800 rounded-md overflow-hidden bg-[#0A0A0A]">
                <Table>
                    <TableHeader className="bg-zinc-900">
                        <TableRow>
                            <TableHead className="text-zinc-400">Produto</TableHead>
                            <TableHead className="text-zinc-400">Descrição</TableHead>
                            <TableHead className="text-zinc-400 text-right">Preço</TableHead>
                            <TableHead className="w-[100px] text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((item) => (
                            <TableRow key={item.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                                <TableCell className="font-medium text-white flex items-center gap-3">
                                    {item.image_url && <img src={item.image_url} alt="" className="w-8 h-8 rounded bg-white/10 object-cover" />}
                                    {item.name}
                                </TableCell>
                                <TableCell className="text-zinc-500 text-xs truncate max-w-[200px]">{item.description || "-"}</TableCell>
                                <TableCell className="text-right font-mono text-[#d4af37]">
                                    R$ {Number(item.price).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <ProductFormDialog
                                            shopId={shopId}
                                            type="product"
                                            category={categoryContext}
                                            initialData={item}
                                            trigger={
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:bg-blue-900/20">
                                                    <Pencil size={14} />
                                                </Button>
                                            }
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-red-500 hover:bg-red-900/20">
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
