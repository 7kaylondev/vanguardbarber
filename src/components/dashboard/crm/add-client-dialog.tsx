
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, Loader2, Phone, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { upsertClientAction } from "@/app/(main)/dashboard/actions"
import { toast } from "sonner"

interface AddClientDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function AddClientDialog({ isOpen, onOpenChange }: AddClientDialogProps) {
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [isExistingClient, setIsExistingClient] = useState(false)
    const [lastVisit, setLastVisit] = useState<Date | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(false)

    // Phone Mask
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '')
        if (val.length > 11) val = val.substring(0, 11)
        val = val.replace(/^(\d{2})(\d)/g, '($1) $2')
        val = val.replace(/(\d{5})(\d)/, '$1-$2')
        setPhone(val)
    }

    const handleSave = async () => {
        if (!name || !phone) return toast.error("Preencha nome e telefone")
        if (isExistingClient && !lastVisit) return toast.error("Informe a data da última visita")

        setIsLoading(true)

        try {
            const lastVisitStr = isExistingClient && lastVisit ? format(lastVisit, "yyyy-MM-dd") : undefined

            const res = await upsertClientAction({
                name,
                phone,
                lastVisit: lastVisitStr
            })

            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Cliente cadastrado com sucesso!")
                onOpenChange(false)
                // Reset
                setName("")
                setPhone("")
                setIsExistingClient(false)
                setLastVisit(undefined)
            }
        } catch (err) {
            console.error(err)
            toast.error("Erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#111] border-zinc-800 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Cliente</DialogTitle>
                    <DialogDescription>
                        Cadastre um cliente manualmente para sua base.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label>Nome do Cliente</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="pl-9 bg-zinc-900 border-zinc-700 focus:ring-[#d4af37]"
                                placeholder="Ex: João Silva"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label>WhatsApp</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                value={phone}
                                onChange={handlePhoneChange}
                                className="pl-9 bg-zinc-900 border-zinc-700 focus:ring-[#d4af37]"
                                placeholder="(11) 99999-9999"
                            />
                        </div>
                    </div>

                    {/* Existing Client Toggle */}
                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                            id="existing"
                            checked={isExistingClient}
                            onCheckedChange={(checked) => setIsExistingClient(!!checked)}
                            className="border-zinc-600 data-[state=checked]:bg-[#d4af37] data-[state=checked]:text-black"
                        />
                        <label
                            htmlFor="existing"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            Já é cliente da casa (Importar histórico)
                        </label>
                    </div>

                    {/* Date Picker (Conditional) */}
                    {isExistingClient && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label>Data da última visita</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-zinc-900 border-zinc-700 hover:bg-zinc-800",
                                            !lastVisit && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {lastVisit ? format(lastVisit, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800">
                                    <Calendar
                                        mode="single"
                                        selected={lastVisit}
                                        onSelect={setLastVisit}
                                        initialFocus
                                        locale={ptBR}
                                        disabled={(date) => date > new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                            <p className="text-[11px] text-zinc-500">Isso ajudará a classificar o cliente corretamente.</p>
                        </div>
                    )}

                </div>

                <DialogFooter>
                    <Button onClick={handleSave} disabled={isLoading} className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f] font-bold">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Cliente
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
