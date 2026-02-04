'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, CreditCard, Trash2, Plus, Loader2 } from "lucide-react"
import { createContract, deleteContract } from "@/app/admin-command/actions"
import { toast } from "sonner"

interface Contract {
    id: string
    client_name: string
    amount: number
    due_day: number
    status: string
}

export function ContractManager({ contracts }: { contracts: Contract[] }) {
    const [loading, setLoading] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [formData, setFormData] = useState({
        client_name: '',
        amount: '',
        due_day: ''
    })

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await createContract({
                client_name: formData.client_name,
                amount: parseFloat(formData.amount),
                due_day: parseInt(formData.due_day)
            })

            if (result.success) {
                toast.success("Contrato adicionado!")
                setIsAdding(false)
                setFormData({ client_name: '', amount: '', due_day: '' })
            } else {
                toast.error("Erro ao adicionar contrato: " + result.error)
            }
        } catch (error) {
            toast.error("Erro desconhecido.")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Remover este contrato?")) return
        setLoading(true)
        try {
            const result = await deleteContract(id)
            if (result.success) {
                toast.success("Contrato removido.")
            } else {
                toast.error("Erro ao remover.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="bg-black border border-green-900/30">
            <CardHeader className="border-b border-green-900/20 py-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-700" />
                    <CardTitle className="text-sm uppercase tracking-wider text-green-500">Gestão de Contratos (Recorrência)</CardTitle>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 border-green-900/50 text-green-700 text-xs hover:text-green-500 hover:bg-green-900/10"
                    onClick={() => setIsAdding(!isAdding)}
                >
                    <Plus className="h-3 w-3 mr-1" />
                    Novo Contrato
                </Button>
            </CardHeader>
            <CardContent className="p-4">
                {isAdding && (
                    <form onSubmit={handleCreate} className="mb-6 p-4 border border-green-900/30 rounded bg-green-900/5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-green-700">Cliente / Barbearia</Label>
                                <Input
                                    className="bg-black border-green-900/30 text-white h-8"
                                    placeholder="Ex: Barbearia Silva"
                                    value={formData.client_name}
                                    onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-green-700">Valor Mensal (R$)</Label>
                                <Input
                                    className="bg-black border-green-900/30 text-white h-8"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-green-700">Dia Vencimento</Label>
                                <Input
                                    className="bg-black border-green-900/30 text-white h-8"
                                    type="number"
                                    min="1"
                                    max="31"
                                    placeholder="5"
                                    value={formData.due_day}
                                    onChange={e => setFormData({ ...formData, due_day: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="text-gray-500">Cancelar</Button>
                            <Button type="submit" size="sm" className="bg-green-800 hover:bg-green-700 text-white" disabled={loading}>
                                {loading && <Loader2 className="animate-spin mr-2 h-3 w-3" />}
                                Salvar Contrato
                            </Button>
                        </div>
                    </form>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-green-900/10 text-green-700 uppercase font-bold">
                            <tr>
                                <th className="p-3">Dia Venc.</th>
                                <th className="p-3">Cliente</th>
                                <th className="p-3">Valor (R$)</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-green-900/20">
                            {contracts.map((contract) => (
                                <tr key={contract.id} className="hover:bg-green-900/5 transition-colors">
                                    <td className="p-3 font-mono text-green-900">Dia {contract.due_day}</td>
                                    <td className="p-3 font-bold text-white uppercase">{contract.client_name}</td>
                                    <td className="p-3 text-white font-mono">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.amount)}
                                    </td>
                                    <td className="p-3">
                                        <Badge variant="outline" className="border-green-800 text-green-500 text-[10px] uppercase">
                                            {contract.status}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-right">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 text-red-500 hover:bg-red-900/20 rounded-none opacity-50 hover:opacity-100"
                                            onClick={() => handleDelete(contract.id)}
                                            disabled={loading}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {contracts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-green-900 italic">Nenhum contrato ativo.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
