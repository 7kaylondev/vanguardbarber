
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { upsertProduct } from "@/app/(main)/dashboard/actions"

interface ProductFormDialogProps {
    shopId: string
    type: 'service' | 'product'
    category?: 'retail' | 'bar' // Context awareness
    trigger?: React.ReactNode
    initialData?: any
    onSuccess?: () => void
}

export function ProductFormDialog({ shopId, type, category = "retail", trigger, initialData, onSuccess }: ProductFormDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        try {
            setLoading(true)
            console.log("Submitting form...", Object.fromEntries(formData))

            formData.append('barbershop_id', shopId)
            formData.append('type', type)
            formData.append('category', category)
            if (initialData?.id) formData.append('id', initialData.id)

            const res = await upsertProduct(formData)
            console.log("Server response:", res)

            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success(initialData ? "Atualizado!" : "Criado com sucesso!")
                setOpen(false)
                if (onSuccess) onSuccess()
            }
        } catch (error: any) {
            console.error("Client Error:", error)
            toast.error("Erro no envio: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-[#d4af37] text-black hover:bg-white font-bold">
                        <Plus className="mr-2 h-4 w-4" />
                        {type === 'service' ? "Novo Serviço" : "Novo Produto"}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-[#111] border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar" : "Adicionar"} {type === 'service' ? "Serviço" : "Produto"}</DialogTitle>
                    <DialogDescription className="sr-only">Preencha os dados abaixo.</DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input name="name" defaultValue={initialData?.name} placeholder={type === 'service' ? "Ex: Corte Degradê" : "Ex: Pomada Matte"} required className="bg-black border-zinc-700" />
                    </div>

                    <div className="flex items-center space-x-2 bg-yellow-900/10 p-2 rounded border border-yellow-900/30">
                        <input type="checkbox" name="highlight" id="highlight" defaultChecked={initialData?.highlight} className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 accent-yellow-500" />
                        <Label htmlFor="highlight" className="text-yellow-500 font-bold cursor-pointer">Marcar como Destaque (⭐)</Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Preço (R$)</Label>
                            <Input name="price" defaultValue={initialData?.price} type="number" step="0.01" placeholder="0.00" required className="bg-black border-zinc-700" />
                        </div>
                        {type !== 'service' ? (
                            <div className="space-y-2">
                                <Label>Estoque Atual</Label>
                                <Input name="quantity" defaultValue={initialData?.quantity || 0} type="number" placeholder="0" className="bg-black border-zinc-700" />
                            </div>
                        ) : (
                            <input type="hidden" name="quantity" value="0" />
                        )}
                        <div className="col-span-2 space-y-2">
                            <Label>Imagem URL (Opcional)</Label>
                            <Input name="image_url" defaultValue={initialData?.image_url} placeholder="https://..." className="bg-black border-zinc-700" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Descrição Curta</Label>
                        <Textarea
                            name="description"
                            defaultValue={initialData?.description}
                            placeholder={type === 'service' ? "Ex: Incluso lavagem e finalização." : "Ex: Alta fixação e efeito seco."}
                            className="bg-black border-zinc-700 h-20"
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-[#d4af37] text-black font-bold">
                        {loading ? "Salvando..." : "Salvar"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
