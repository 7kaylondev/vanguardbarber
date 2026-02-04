
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"

// Assumption: We need a server action to approve. For now, just UI.

export default async function SuperAdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // In a real scenario, check if user.email === 'kaylon@vanguarda.com' or role === 'superadmin'

    const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <header className="mb-10 border-b border-[#d4af37]/20 pb-4">
                <h1 className="text-3xl font-serif text-[#d4af37]">Superadmin Vanguarda</h1>
                <p className="text-gray-400">Central de Comando</p>
            </header>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Leads Pendentes</h2>
                    <Badge variant="outline" className="border-[#d4af37] text-[#d4af37]">{leads?.length || 0} Novos</Badge>
                </div>

                <div className="rounded-lg border border-[#d4af37]/20 bg-[#111]">
                    <Table>
                        <TableHeader className="bg-[#d4af37]/10">
                            <TableRow className="hover:bg-transparent border-[#d4af37]/10">
                                <TableHead className="text-[#d4af37]">Barbeiro</TableHead>
                                <TableHead className="text-[#d4af37]">Barbearia</TableHead>
                                <TableHead className="text-[#d4af37]">WhatsApp</TableHead>
                                <TableHead className="text-[#d4af37]">Status</TableHead>
                                <TableHead className="text-right text-[#d4af37]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leads?.map((lead) => (
                                <TableRow key={lead.id} className="border-[#d4af37]/10 hover:bg-[#d4af37]/5">
                                    <TableCell className="font-medium">{lead.barber_name}</TableCell>
                                    <TableCell>{lead.barbershop_name}</TableCell>
                                    <TableCell>{lead.whatsapp}</TableCell>
                                    <TableCell>
                                        <Badge variant={lead.status === 'approved' ? 'default' : 'secondary'}
                                            className={lead.status === 'approved' ? 'bg-green-900 text-green-300' : 'bg-yellow-900/50 text-yellow-500'}>
                                            {lead.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" className="border-green-800 text-green-500 hover:bg-green-900/50">
                                                <Check size={14} className="mr-1" /> Aprovar
                                            </Button>
                                            <Button size="sm" variant="outline" className="border-red-800 text-red-500 hover:bg-red-900/50">
                                                <X size={14} className="mr-1" /> Rejeitar
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!leads || leads.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        Nenhum lead encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
