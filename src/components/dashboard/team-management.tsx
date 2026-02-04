
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { upsertProfessional, deleteProfessional } from "@/app/(main)/dashboard/actions"
import { toast } from "sonner"
import { User, Scissors, Trash2, Edit2, Plus, DollarSign, Loader2 } from "lucide-react"

interface TeamManagementProps {
    shopId: string
    professionals: any[]
}

export function TeamManagement({ shopId, professionals }: TeamManagementProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentPro, setCurrentPro] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    // Form State
    const [name, setName] = useState('')
    const [specialty, setSpecialty] = useState('')
    const [commission, setCommission] = useState(0)
    const [active, setActive] = useState(true)
    const [photoUrl, setPhotoUrl] = useState('')

    const openModal = (pro: any = null) => {
        setCurrentPro(pro)
        if (pro) {
            setName(pro.name)
            setSpecialty(pro.specialty || '')
            setCommission(pro.commission_percent || 0)
            setActive(pro.active)
            setPhotoUrl(pro.photo_url || '')
        } else {
            setName('')
            setSpecialty('')
            setCommission(0)
            setActive(true)
            setPhotoUrl('')
        }
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        setLoading(true)
        const formData = new FormData()
        if (currentPro) formData.append('id', currentPro.id)
        formData.append('barbershop_id', shopId)
        formData.append('name', name)
        formData.append('specialty', specialty)
        formData.append('commission_percent', commission.toString())
        formData.append('active', String(active))
        formData.append('photo_url', photoUrl)

        const res = await upsertProfessional(formData)
        setLoading(false)

        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success("Profissional salvo com sucesso!")
            setIsModalOpen(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir?")) return
        const res = await deleteProfessional(id)
        if (res?.error) toast.error(res.error)
        else toast.success("Profissional removido.")
    }

    const handleMockStats = () => {
        // In a real app, this would fetch from server
        alert("Comissões acumuladas este mês: R$ 0,00 (Vendas: 0)")
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#111] p-4 rounded-xl border border-zinc-800">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <User className="text-yellow-500" /> Equipe de Elite
                </h2>
                <Button onClick={() => openModal()} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Novo
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map(pro => (
                    <Card key={pro.id} className="bg-[#111] border-zinc-800 relative overflow-hidden hover:border-yellow-900/50 transition-colors">
                        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-yellow-500/10 to-transparent pointer-events-none rounded-bl-3xl`} />

                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-yellow-900">
                                        {pro.photo_url ? <img src={pro.photo_url} className="h-full w-full object-cover" /> : <Scissors className="text-zinc-500" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{pro.name}</h3>
                                        <p className="text-xs text-yellow-500 uppercase tracking-wider">{pro.specialty || 'Barbeiro'}</p>
                                    </div>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${pro.active ? 'bg-green-500' : 'bg-red-500'}`} />
                            </div>

                            <div className="mt-6 flex items-center justify-between text-sm text-zinc-400 border-t border-zinc-800 pt-4">
                                <span>Comissão: <b className="text-white">{pro.commission_percent}%</b></span>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1 border-zinc-700 hover:bg-zinc-800 text-xs" onClick={() => openModal(pro)}>
                                    <Edit2 className="w-3 h-3 mr-2" /> Editar
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 border-zinc-700 hover:bg-zinc-800 text-xs text-green-500" onClick={handleMockStats}>
                                    <DollarSign className="w-3 h-3 mr-2" /> Comissões
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-900 hover:text-red-500" onClick={() => handleDelete(pro.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {professionals.length === 0 && (
                    <div className="col-span-full py-12 text-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl">
                        Nenhum profissional cadastrado. Adicione sua equipe.
                    </div>
                )}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#111] border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>{currentPro ? "Editar Profissional" : "Novo Profissional"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} className="bg-black border-zinc-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>Especialidade</Label>
                            <Input value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Ex: Cortes Clássicos" className="bg-black border-zinc-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>Comissão (%)</Label>
                            <Input type="number" value={commission} onChange={e => setCommission(parseFloat(e.target.value))} className="bg-black border-zinc-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>Foto URL</Label>
                            <Input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://..." className="bg-black border-zinc-700" />
                        </div>
                        <div className="flex items-center justify-between bg-zinc-900 p-3 rounded border border-zinc-800">
                            <Label>Ativo?</Label>
                            <Switch checked={active} onCheckedChange={setActive} className="data-[state=checked]:bg-green-600" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave} disabled={loading} className="bg-yellow-600 hover:bg-yellow-500 text-black">
                            {loading && <Loader2 className="mr-2 animate-spin" />} Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
