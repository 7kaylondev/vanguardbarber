import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Users,
    Store,
    DollarSign,
    Activity,
    ShieldCheck,
    Terminal,
    Calendar,
    CreditCard
} from "lucide-react"
import { LeadRowActions } from "@/components/admin/lead-row-actions"
import { signOutAdmin } from "./actions"
import { ContractManager } from "@/components/admin/contract-manager"

export default async function AdminCommandPage() {
    const supabase = await createClient()

    // 1. Fetch Leads (Persistent)
    const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false })

    // 2. Fetch Active Shops
    const { data: barbershops, count: shopCount } = await supabase
        .from('barbershops')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

    // 3. Fetch Contracts (Financials)
    const { data: contracts } = await supabase
        .from('admin_contracts')
        .select('*')
        .order('due_day', { ascending: true })

    // Calculate MRR
    const totalMRR = contracts?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

    return (
        <div className="min-h-screen bg-[#050505] text-green-500 font-mono selection:bg-green-900 selection:text-white p-6">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 border-b border-green-900/30 pb-6">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-green-900/10 border border-green-900/50 flex items-center justify-center rounded">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-widest uppercase text-white">Comando Vanguarda</h1>
                        <p className="text-xs text-green-800">Status do Sistema: <span className="text-green-500 animate-pulse">ONLINE</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="border-green-900 text-green-700">v2.1.0-beta</Badge>
                    <form action={signOutAdmin}>
                        <Button variant="ghost" className="text-green-700 hover:text-green-500 hover:bg-green-900/10">Sair (Log Out)</Button>
                    </form>
                </div>
            </header>

            {/* Metrics Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-black border border-green-900/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-800 uppercase">Total de Leads</CardTitle>
                        <Users className="h-4 w-4 text-green-800" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{leads?.length || 0}</div>
                        <p className="text-xs text-green-900">Histórico completo</p>
                    </CardContent>
                </Card>
                <Card className="bg-black border border-green-900/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-800 uppercase">Barbearias Ativas</CardTitle>
                        <Store className="h-4 w-4 text-green-800" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{shopCount || 0}</div>
                        <p className="text-xs text-green-900">100% Uptime</p>
                    </CardContent>
                </Card>
                <Card className="bg-black border border-green-900/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-800 uppercase">MRR (Faturamento)</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-800" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalMRR)}
                        </div>
                        <p className="text-xs text-green-900">Recorrência Mensal</p>
                    </CardContent>
                </Card>
                <Card className="bg-black border border-green-900/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-800 uppercase">Carga do Sistema</CardTitle>
                        <Activity className="h-4 w-4 text-green-800" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">4%</div>
                        <p className="text-xs text-green-900">Ideal</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="leads" className="space-y-6">
                <TabsList className="bg-black border border-green-900/30 p-1">
                    <TabsTrigger value="leads" className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-500 text-green-900">Leads (Sinais)</TabsTrigger>
                    <TabsTrigger value="shops" className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-500 text-green-900">Barbearias Ativas</TabsTrigger>
                    <TabsTrigger value="finance" className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-500 text-green-900">Financeiro (Manual)</TabsTrigger>
                </TabsList>

                {/* TAB: LEADS */}
                <TabsContent value="leads" className="space-y-4">
                    <Card className="bg-black border border-green-900/30">
                        <CardHeader className="border-b border-green-900/20 py-4">
                            <div className="flex items-center gap-2">
                                <Terminal className="h-4 w-4 text-green-700" />
                                <CardTitle className="text-sm uppercase tracking-wider text-green-500">Fluxo de Entrada (Leads)</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-green-900/10 text-green-700 uppercase font-bold">
                                    <tr>
                                        <th className="p-3">Data / Hora</th>
                                        <th className="p-3">Fonte (Nome)</th>
                                        <th className="p-3">Alvo (Barbearia)</th>
                                        <th className="p-3">Email / Chave</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-green-900/20">
                                    {leads?.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-green-900/5 transition-colors group">
                                            <td className="p-3 text-green-900 font-mono">
                                                <div>{new Date(lead.created_at).toLocaleDateString('pt-BR')}</div>
                                                <div className="text-[10px] opacity-70">{new Date(lead.created_at).toLocaleTimeString('pt-BR')}</div>
                                            </td>
                                            <td className="p-3 font-bold text-white">{lead.barber_name}</td>
                                            <td className="p-3 text-gray-400">{lead.barbershop_name}</td>
                                            <td className="p-3 font-mono text-[10px]">
                                                <div className="text-white">{lead.email}</div>
                                                <div className="text-green-700">{lead.whatsapp}</div>
                                            </td>
                                            <td className="p-3">
                                                {lead.status === 'pending' && <span className="px-2 py-0.5 rounded bg-yellow-900/20 text-yellow-600 text-[10px] uppercase border border-yellow-900/30">Pendente</span>}
                                                {lead.status === 'approved' && <span className="px-2 py-0.5 rounded bg-green-900/20 text-green-500 text-[10px] uppercase border border-green-900/30">Ativo</span>}
                                                {lead.status === 'rejected' && <span className="px-2 py-0.5 rounded bg-red-900/20 text-red-500 text-[10px] uppercase border border-red-900/30 line-through">Rejeitado</span>}
                                            </td>
                                            <td className="p-3 text-right">
                                                <LeadRowActions lead={lead} />
                                            </td>
                                        </tr>
                                    ))}
                                    {(!leads || leads.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-green-900 italic">Nenhum lead encontrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB: SHOPS */}
                <TabsContent value="shops" className="space-y-4">
                    <Card className="bg-black border border-green-900/30">
                        <CardHeader className="border-b border-green-900/20 py-4">
                            <div className="flex items-center gap-2">
                                <Store className="h-4 w-4 text-green-700" />
                                <CardTitle className="text-sm uppercase tracking-wider text-green-500">Barbearias Ativas</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-green-900/10 text-green-700 uppercase font-bold">
                                    <tr>
                                        <th className="p-3">Nome</th>
                                        <th className="p-3">Slug (Link)</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Plano</th>
                                        <th className="p-3 text-right">Criado em</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-green-900/20">
                                    {barbershops?.map((shop) => (
                                        <tr key={shop.id} className="hover:bg-green-900/5 transition-colors">
                                            <td className="p-3 font-bold text-white">{shop.name}</td>
                                            <td className="p-3 text-green-700 underline decoration-green-900/50">
                                                <a href={`/v/${shop.slug}`} target="_blank">/v/{shop.slug}</a>
                                            </td>
                                            <td className="p-3 text-white uppercase">{shop.status}</td>
                                            <td className="p-3 text-gray-500">Standard</td>
                                            <td className="p-3 text-right text-green-900 font-mono">
                                                {new Date(shop.created_at).toLocaleDateString('pt-BR')}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!barbershops || barbershops.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-green-900 italic">Nenhuma barbearia ativa.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB: FINANCE */}
                <TabsContent value="finance" className="space-y-4">
                    <ContractManager contracts={contracts || []} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
