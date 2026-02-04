"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Edit2, Loader2, Plus, Trash2, Crown, Check } from "lucide-react"
import { toast } from "sonner"
import { upsertProduct, deleteProduct } from "@/app/(main)/dashboard/actions"

interface ClubManagerProps {
    plans: any[]
    shopId: string
}

export function ClubManager({ plans, shopId }: ClubManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [editingPlan, setEditingPlan] = useState<any>(null)

    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [description, setDescription] = useState("")
    const [benefits, setBenefits] = useState<string[]>([])
    const [tempBenefit, setTempBenefit] = useState("")

    const handleOpen = (plan?: any) => {
        if (plan) {
            setEditingPlan(plan)
            setName(plan.name)
            setPrice(plan.price.toString())
            setDescription(plan.description || "") // We might store raw description or split benefits
            // Assuming description stores benefits line by line for now
            setBenefits(plan.description ? plan.description.split('\n') : [])
            setIsDialogOpen(true)
        } else {
            setEditingPlan(null)
            setName("")
            setPrice("")
            setDescription("")
            setBenefits([])
            setIsDialogOpen(true)
        }
    }

    const addBenefit = () => {
        if (tempBenefit.trim()) {
            setBenefits([...benefits, tempBenefit.trim()])
            setTempBenefit("")
        }
    }

    const removeBenefit = (index: number) => {
        setBenefits(benefits.filter((_, i) => i !== index))
    }

    const handleSave = async () => {
        if (!name || !price) {
            toast.error("Preencha nome e preço.")
            return
        }

        setIsLoading(true)

        try {
            const formData = new FormData()
            if (editingPlan) formData.append('id', editingPlan.id)
            formData.append('barbershop_id', shopId)
            formData.append('name', name)
            formData.append('price', price.replace(',', '.'))

            // Join benefits with newlines for storage
            const finalDesc = benefits.join('\n')
            formData.append('description', finalDesc)

            formData.append('type', 'club') // Critical
            formData.append('image_url', '') // Optional
            formData.append('highlight', 'true') // Always highlight plans?

            const res = await upsertProduct(formData)

            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success(editingPlan ? "Plano atualizado!" : "Plano criado!")
                setIsDialogOpen(false)
            }
        } catch (error) {
            toast.error("Erro ao salvar.")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir este plano?")) return
        const res = await deleteProduct(id)
        if (res?.success) toast.success("Plano removido.")
        else toast.error("Erro ao remover.")
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#111] p-6 rounded-xl border border-zinc-800">
                <div>
                    <h2 className="text-xl font-bold text-white mb-1">Planos de Assinatura</h2>
                    <p className="text-gray-400 text-sm">Crie opções recorrentes para fidelizar seus clientes.</p>
                </div>
                <Button onClick={() => handleOpen()} className="bg-[#d4af37] text-black hover:bg-[#b5952f]">
                    <Plus className="mr-2 h-4 w-4" /> Novo Plano
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <Card key={plan.id} className="bg-[#111] border-zinc-800 hover:border-[#d4af37]/50 transition-colors group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white bg-black/50" onClick={() => handleOpen(plan)}>
                                <Edit2 size={14} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300 bg-black/50" onClick={() => handleDelete(plan.id)}>
                                <Trash2 size={14} />
                            </Button>
                        </div>

                        <CardHeader className="pb-2">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Crown className="text-[#d4af37]" size={20} />
                                {plan.name}
                            </CardTitle>
                            <CardDescription className="text-2xl font-bold text-white">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}
                                <span className="text-sm font-normal text-zinc-500">/mês</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {(plan.description || "").split('\n').map((benefit: string, i: number) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                                        <Check size={14} className="text-green-500" />
                                        {benefit}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {plans.length === 0 && (
                    <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                        Nenhum plano ativo. Crie o primeiro para ativar o Clube!
                    </div>
                )}
            </div>

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#111] border-zinc-800 text-white sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? 'Editar Plano' : 'Novo Plano do Clube'}</DialogTitle>
                        <DialogDescription>Configure os detalhes da assinatura.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome do Plano</Label>
                            <Input
                                placeholder="Ex: Clube VIP, Corte Ilimitado"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="bg-black border-zinc-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Valor Mensal (R$)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="bg-black border-zinc-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Benefícios</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ex: Cortes ilimitados..."
                                    value={tempBenefit}
                                    onChange={e => setTempBenefit(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addBenefit()}
                                    className="bg-black border-zinc-700"
                                />
                                <Button onClick={addBenefit} variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700">
                                    <Plus size={16} />
                                </Button>
                            </div>

                            <div className="space-y-2 mt-2 max-h-[150px] overflow-y-auto">
                                {benefits.map((b, i) => (
                                    <div key={i} className="flex justify-between items-center bg-zinc-900/50 p-2 rounded border border-zinc-800 text-sm">
                                        <span>{b}</span>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-500 hover:text-red-500" onClick={() => removeBenefit(i)}>
                                            <Trash2 size={12} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-[#d4af37] text-black hover:bg-[#b5952f] w-full font-bold">
                            {isLoading && <Loader2 className="mr-2 animate-spin" />}
                            Salvar Plano
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
