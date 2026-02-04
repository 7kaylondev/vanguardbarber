'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { useActionState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { createProduct } from "@/app/actions/product"
import { toast } from "sonner" // Assuming sonner is installed, or we use standard alert if not

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full bg-primary text-black font-bold hover:bg-white" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : "Adicionar Produto"}
        </Button>
    )
}

export function CreateProductDialog() {
    const [open, setOpen] = useState(false)
    const [state, formAction] = useActionState(createProduct, {} as any)

    // Effect to close dialog on success is tricky with just state.
    // Ideally checking if state.success is true.
    if (state?.success && open) {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-black font-bold hover:bg-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Produto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#0A0A0A] border-primary/20 text-white">
                <DialogHeader>
                    <DialogTitle className="text-primary font-serif text-xl">Novo Produto</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Adicione um item ao seu estoque.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Nome do Produto</Label>
                        <Input id="title" name="title" className="bg-[#1A1A1A] border-primary/20" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Preço (R$)</Label>
                            <Input id="price" name="price" type="number" step="0.01" className="bg-[#1A1A1A] border-primary/20" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="stock">Estoque</Label>
                            <Input id="stock" name="stock_quantity" type="number" className="bg-[#1A1A1A] border-primary/20" required />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select name="category" required>
                            <SelectTrigger className="bg-[#1A1A1A] border-primary/20">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1A1A1A] border-primary/20 text-white">
                                <SelectItem value="Cabelo">Cabelo (Pomadas/Gels)</SelectItem>
                                <SelectItem value="Barba">Barba (Óleos/Balms)</SelectItem>
                                <SelectItem value="Kits">Kits</SelectItem>
                                <SelectItem value="Acessórios">Acessórios</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="image">URL da Imagem</Label>
                        <Input id="image" name="image_url" placeholder="https://..." className="bg-[#1A1A1A] border-primary/20" />
                    </div>
                    <SubmitButton />
                </form>
            </DialogContent>
        </Dialog>
    )
}
